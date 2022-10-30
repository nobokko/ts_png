<!-- Please remove this file from your project -->
<template>
  <div
    data-pnginfo="root"
    class="
      relative
      flex flex-row
      gap-x-4
      items-top
      justify-center
      min-h-screen
      bg-gray-100
      sm:items-center sm:pt-0
    "
  >
    <div data-testid="image" class="min-h-screen basis-1/3">
      <form>
        <label>
          <input id="pnginfo_image" type="file" @change="readfile" />
          <img :src="imageSrc" alt="" class="rounded-2xl" />
        </label>
      </form>
    </div>
    <div class="min-h-screen basis-2/3 relative flex flex-col gap-y-4">
      <div
        class="
          before:block before:absolute before:left-0
          ml-32
          before:content-[attr(data-before-content)]
        "
        data-before-content="copy all"
      >
        <span
          class="cursor-pointer"
          v-clipboard:copy="
            promptArea + '\n' + nevativePromptArea + '\n' + nonPromptArea
          "
          v-clipboard:success="onCopySuccess"
          v-clipboard:error="onCopyError"
        >
          <font-awesome-icon icon="fa-regular fa-clone" />
        </span>
      </div>
      <div
        id="prompt_area"
        class="
          basis-1/4
          before:block before:absolute before:left-0
          ml-32
          before:content-[attr(data-before-content)]
          break-all
        "
        data-before-content="prompt"
      >
        {{ promptArea }}
        <span
          class="cursor-pointer"
          v-clipboard:copy="promptArea"
          v-clipboard:success="onCopySuccess"
          v-clipboard:error="onCopyError"
        >
          <font-awesome-icon
            class="cursor-pointer"
            icon="fa-regular fa-clone"
          />
        </span>
      </div>
      <div
        id="negative_prompt_area"
        class="
          basis-1/4
          before:block before:absolute before:left-0
          ml-32
          before:content-[attr(data-before-content)]
          break-all
        "
        data-before-content="negative prompt"
      >
        {{ nevativePromptArea }}
        <span
          class="cursor-pointer"
          v-clipboard:copy="nevativePromptArea"
          v-clipboard:success="onCopySuccess"
          v-clipboard:error="onCopyError"
        >
          <font-awesome-icon icon="fa-regular fa-clone" />
        </span>
      </div>
      <div
        id="non_prompt_area"
        class="
          basis-1/4
          before:block before:absolute before:left-0
          ml-32
          before:content-[attr(data-before-content)]
          break-all
        "
        data-before-content="non prompt"
      >
        {{ nonPromptArea }}
        <span
          class="cursor-pointer"
          v-clipboard:copy="nonPromptArea"
          v-clipboard:success="onCopySuccess"
          v-clipboard:error="onCopyError"
        >
          <font-awesome-icon icon="fa-regular fa-clone" />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  PngInfoReader,
  PngInfoReaderTextEventParameter,
} from '~/assets/scripts/PngInfoReader'
import Vue, { defineComponent } from 'vue'
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

export default defineComponent({
  name: 'PngInfo',
  data() {
    return {
      data: [],
      imageSrc: '',
      promptArea: '',
      nevativePromptArea: '',
      nonPromptArea: '',
    }
  },
  methods: {
    onCopySuccess: function (
      e: string | HTMLElement | HTMLCollection | NodeList
    ) {
      this.$toast.success('クリップボードにコピーしました')
    },
    onCopyError: function (
      e: string | HTMLElement | HTMLCollection | NodeList
    ) {
      this.$toast.error('クリップボードにコピーできなかったかも')
    },
    readfile: function (e: Event) {
      const file = (<HTMLInputElement | null>e?.target)?.files?.[0]

      const pngInfoReader = new PngInfoReader()
      pngInfoReader.addEventListener('start', () => {
        this.promptArea = ''
      })
      pngInfoReader.addEventListener(
        'text',
        (params: PngInfoReaderTextEventParameter) => {
          const { key, data, value } = params
          if (key === 'parameters') {
            const reParamCode = new RegExp(
              '\\s*([\\w ]+):\\s*("(?:\\|"|[^"])+"|[^,]*)(?:,|$)',
              'g'
            )
            const reParams = new RegExp('^(?:' + reParamCode.source + '){3,}$')
            const splitedStr = value.split('\n')
            const maybeNonPromptInfo = (() => {
              const lastLine = splitedStr.pop() ?? ''
              console.log(reParams.source)
              if (reParams.test(lastLine)) {
                return lastLine
              } else {
                splitedStr.push(lastLine)

                return ''
              }
            })()
            const { prompt, negativePrompt } = (() => {
              let done_with_prompt = false
              return splitedStr.reduce<{
                prompt: string
                negativePrompt: string
              }>(
                (
                  prev: { prompt: string; negativePrompt: string },
                  current: string
                ) => {
                  if (current.startsWith('Negative prompt:')) {
                    done_with_prompt = true
                    prev.negativePrompt += current.substring(16)
                  } else {
                    if (done_with_prompt) {
                      prev.negativePrompt += current
                    } else {
                      prev.prompt += current
                    }
                  }

                  return prev
                },
                { prompt: '', negativePrompt: '' }
              )
            })()
            const nonPromptInfo = [
              ...maybeNonPromptInfo.matchAll(reParamCode),
            ].reduce<{ [key: string]: string }>((prev, current) => {
              const [, key, value] = current
              prev[key] = value

              return prev
            }, {})
            this.promptArea = prompt
            this.nevativePromptArea = negativePrompt
            this.nonPromptArea = maybeNonPromptInfo
          }
        }
      )

      pngInfoReader.read(file)

      if (file) {
        const imageReader = new FileReader()
        imageReader.onload = () => {
          this.imageSrc = imageReader.result as string
        }
        imageReader.readAsDataURL(file)
      }
    },
  },
})

function uiElementIsVisible(el: Element) {
  let isVisible = !el.closest('.\\!hidden')
  if (!isVisible) {
    return false
  }

  while (
    (isVisible =
      (el.closest('.tabitem') as HTMLElement)?.style.display !== 'none')
  ) {
    if (!isVisible) {
      return false
    } else if (el.parentElement) {
      el = el.parentElement
    } else {
      break
    }
  }
  return isVisible
}
function isValidImageList(files?: FileList) {
  return (
    files &&
    files?.length === 1 &&
    ['image/png', 'image/gif', 'image/jpeg'].includes(files[0].type)
  )
}

function dropReplaceImage(imgWrap: Element, files?: FileList) {
  if (!isValidImageList(files)) {
    return
  }

  // imgWrap.querySelector('.modify-upload button + button, .touch-none + div button + button')?.click();
  const callback = () => {
    const fileInput = imgWrap.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement | null
    if (fileInput) {
      fileInput.files = files ?? new FileList()
      fileInput.dispatchEvent(new Event('change'))
    }
  }

  if (imgWrap.closest('#pnginfo_image')) {
    // special treatment for PNG Info tab, wait for fetch request to finish
    const oldFetch = window.fetch
    window.fetch = async (input, options) => {
      const response = await oldFetch(input, options)
      if ('api/predict/' === input) {
        const content = await response.text()
        window.fetch = oldFetch
        window.requestAnimationFrame(() => callback())
        return new Response(content, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
      }
      return response
    }
  } else {
    window.requestAnimationFrame(() => callback())
  }
}

window.addEventListener('paste', (e) => {
  if (e) {
    const files = (e as ClipboardEvent).clipboardData?.files
    if (!isValidImageList(files)) {
      return
    }

    const visibleImageFields = Array.from(
      document.querySelectorAll('[data-testid="image"]')
    ).filter((el) => uiElementIsVisible(el))
    if (!visibleImageFields.length) {
      return
    }

    const firstFreeImageField = visibleImageFields.filter((el) =>
      el.querySelector('input[type=file]')
    )?.[0]

    dropReplaceImage(
      firstFreeImageField
        ? firstFreeImageField
        : visibleImageFields[visibleImageFields.length - 1],
      files
    )
  }
})

window.document.addEventListener('dragover', (e: DragEvent) => {
  const target = <HTMLElement | null>e.composedPath()[0]
  const imgWrap = target?.closest('[data-pnginfo="root"]')
  if (!imgWrap) {
    return
  }
  e.stopPropagation()
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
})

window.document.addEventListener('drop', (e: DragEvent) => {
  const target = <HTMLElement | null>e.composedPath()[0]
  const imgWrap = target?.closest('[data-pnginfo="root"]')
  if (!imgWrap) {
    return
  }
  e.stopPropagation()
  e.preventDefault()
  const files = e.dataTransfer?.files
  dropReplaceImage(imgWrap, files)
})
</script>
