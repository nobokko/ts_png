/** */
type PngInfoReaderEventType = 'start' | 'chunk' | 'end' | 'error'
/**
 * IHDR - 最も先頭に配置されるチャンクで、以下の順番で13バイトの情報が含まれる。
 * 画像の幅（4バイト）
 * 画像の高さ（4バイト）
 * 色深度（1バイト）
 * カラータイプ（1バイト）
 * 圧縮形式（1バイト）
 * フィルタ形式（1バイト）
 * インターレース形式（1バイト）
 */
const PngInfoReaderChunkTypeIhdr = 'IHDR'
/**
 * PLTE - カラーパレット定義。
 */
const PngInfoReaderChunkTypePlte = 'PLTE'
/**
 * IDAT - zlibにより圧縮されたイメージデータ。複数のIDATチャンクに分割することもできる。この場合ファイルサイズは若干増えるが、PNGをストリームとして生成することができるようになる。
 */
const PngInfoReaderChunkTypeIdat = 'IDAT'
/**
 * IEND - イメージの終端を示す。
 */
const PngInfoReaderChunkTypeIend = 'IEND'
/** 必須チャンク */
type PngInfoReaderChunkRequiredType = typeof PngInfoReaderChunkTypeIhdr | typeof PngInfoReaderChunkTypePlte | typeof PngInfoReaderChunkTypeIdat | typeof PngInfoReaderChunkTypeIend
/** acTL - アニメーテッドPNGである事を示し、総フレーム数やループ回数を保持する。*/
const PngInfoReaderChunkTypeActl = 'acTL'
/** bKGD - デフォルトの背景色を指定する。これは、単独のイメージビューアで表示するときなど、背景色が特に定まらない場合を想定している。ただし、Internet Explorer 6以前はアルファ値による透過表示をサポートせず、この値を背景色として使用する。*/
const PngInfoReaderChunkTypeBkgd = 'bKGD'
/** cHRM - ホワイトバランスを指定する。*/
const PngInfoReaderChunkTypeChrm = 'cHRM'
/** eXIf - Exifメタデータを保持する。*/
const PngInfoReaderChunkTypeExif = 'eXIf'
/** fcTL - アニメーテッドPNGのフレーム制御情報を保持する。*/
const PngInfoReaderChunkTypeFctl = 'fcTL'
/** fdAT - アニメーテッドPNGのフレーム画像データを保持する。*/
const PngInfoReaderChunkTypeFdat = 'fdAT'
/** gAMA - ガンマ補正値を指定する。*/
const PngInfoReaderChunkTypeGama = 'gAMA'
/** hIST - ヒストグラム、またはイメージ内で使用されている各色の総量を保持する。*/
const PngInfoReaderChunkTypeHist = 'hIST'
/** iCCP - ICCカラープロファイルを保持する。*/
const PngInfoReaderChunkTypeIccp = 'iCCP'
/** iTXt - UTF-8フォーマットのテキストを保持する。圧縮・非圧縮、IETF言語タグを伴うことができる。*/
const PngInfoReaderChunkTypeItxt = 'iTXt'
/** pHYs - ピクセルの物理サイズ、またはイメージのアスペクト比を指定する。*/
const PngInfoReaderChunkTypePhys = 'pHYs'
/** sBIT - 元データの有効なビット数を示す。*/
const PngInfoReaderChunkTypeSbit = 'sBIT'
/** sPLT - イメージが使用する色を全てカバーできない時に、代替となるパレットを提示する。*/
const PngInfoReaderChunkTypeSplt = 'sPLT'
/** sRGB - 標準的なsRGBの色空間が使われていることを示す。 */
const PngInfoReaderChunkTypeSrgb = 'sRGB'
/** tEXt - ISO 8859-1形式のテキストを保持する。キーワードと対になるチャンクを複数持つことができる。テキストの圧縮は行われない。*/
const PngInfoReaderChunkTypeText = 'tEXt'
/** tIME - イメージの最終更新日時を保持する。 */
const PngInfoReaderChunkTypeTime = 'tIME'
/** tRNS - 透過色情報を保持する。ピクセル単位のアルファ値指定が必要ない場合に使用する。インデックスカラーのイメージについてはインデックスに結びつけるアルファ値、トゥルーカラーやグレースケールのイメージについては、完全に透過とみなす色を指定する。 */
const PngInfoReaderChunkTypeTrns = 'tRNS'
/** zTXt - tEXtチャンクと同じ制限の圧縮テキスト。 */
const PngInfoReaderChunkTypeZtxt = 'zTXt'
/** 補助チャンク */
type PngInfoReaderChunkOptionalType = typeof PngInfoReaderChunkTypeActl | typeof PngInfoReaderChunkTypeBkgd | typeof PngInfoReaderChunkTypeChrm | typeof PngInfoReaderChunkTypeExif | typeof PngInfoReaderChunkTypeFctl | typeof PngInfoReaderChunkTypeFdat | typeof PngInfoReaderChunkTypeGama | typeof PngInfoReaderChunkTypeHist | typeof PngInfoReaderChunkTypeIccp | typeof PngInfoReaderChunkTypeItxt | typeof PngInfoReaderChunkTypePhys | typeof PngInfoReaderChunkTypeSbit | typeof PngInfoReaderChunkTypeSplt | typeof PngInfoReaderChunkTypeSrgb | typeof PngInfoReaderChunkTypeText | typeof PngInfoReaderChunkTypeTime | typeof PngInfoReaderChunkTypeTrns | typeof PngInfoReaderChunkTypeZtxt
/** チャンク */
type PngInfoReaderChunkType = PngInfoReaderChunkRequiredType | PngInfoReaderChunkOptionalType
/** */
export type PngInfoReaderChunkEventParameter = { chunkType: PngInfoReaderChunkType, chunkSize: number, chunkData: Uint8Array, chunkCrc: Uint8Array }
/** */
type PngInfoReaderChunkEventCallableFunction = (chunkInfo: PngInfoReaderChunkEventParameter) => void

/** */
export class PngInfoReader {
  #listeners: { [key: string]: CallableFunction[] } = {}
  addEventListener(event: PngInfoReaderEventType, callback: CallableFunction | PngInfoReaderChunkEventCallableFunction) {
    if (!this.#listeners[event]) {
      this.#listeners[event] = []
    }
    this.#listeners[event].push(callback)
  }
  async read(file?: File) {
    const fileReader = new FileReader()
    const text_decoder = new TextDecoder('utf-8')

    return new Promise((resolve, reject) => {
      fileReader.onload = (event: ProgressEvent<FileReader>) => {
        this.#listeners['start']?.forEach((callback) => {
          callback()
        })
        const bytes = event.target!.result as ArrayBuffer
        const uint8bytes = new Uint8Array(bytes)
        if (
          uint8bytes[0] === 0x89 &&
          uint8bytes[1] === 'P'.charCodeAt(0) &&
          uint8bytes[2] === 'N'.charCodeAt(0) &&
          uint8bytes[3] === 'G'.charCodeAt(0) &&
          uint8bytes[4] === 0x0d &&
          uint8bytes[5] === 0x0a &&
          uint8bytes[6] === 0x1a &&
          uint8bytes[7] === 0x0a
        ) {
          for (let i = 8; i < uint8bytes.byteLength;) {
            const chunkSize = new Uint32Array(
              uint8bytes.slice(i, i + 4).reverse().buffer
            )[0]
            i += 4
            const chunkType = text_decoder.decode(uint8bytes.slice(i, i + 4))
            i += 4
            const chunkData = uint8bytes.slice(i, i + chunkSize)
            i += Number(chunkSize)
            const chunkCrc = uint8bytes.slice(i, i + 4)
            i += 4
            this.#listeners['chunk']?.forEach((callback) => {
              callback({ chunkType, chunkSize, chunkData, chunkCrc })
            })
            if (chunkType === PngInfoReaderChunkTypeIend) {
              break
            }
          }
        } else {
          this.#listeners['error']?.forEach((callback) => {
            callback()
          })
        }
        this.#listeners['end']?.forEach((callback) => {
          callback()
        })
        resolve(undefined)
      }
      if (file) {
        fileReader.readAsArrayBuffer(file)
      } else {
        this.#listeners['error']?.forEach((callback) => {
          callback()
        })
        reject()
      }
    })
  }
}
