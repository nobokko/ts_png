import VueTestUtils, { mount } from '@vue/test-utils'
import PngInfo from '~/components/PngInfo.vue'

describe('PngInfo', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(PngInfo, {
      stubs: ["font-awesome-icon"],
    })
    expect(wrapper.vm).toBeTruthy()
  })
})
