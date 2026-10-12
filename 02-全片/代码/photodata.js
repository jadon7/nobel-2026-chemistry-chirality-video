// photodata.js —— 真实照片和官方肖像（素材/photos/，来源和授权见 素材/photos/manifest.json）
// fx/fy：脸部中心在图里的位置（0..1）；zoom：在 cover 基础上再放大；credit：画面上的署名
const PHOTOS = {
  kagan: { file: 'kagan_2013_commons_portrait.jpg', fx: .40, fy: .26, zoom: 1.25, credit: '照片：École polytechnique / Flickr · CC BY-SA 2.0' },
  kagan_ill: { file: 'nobel_ill_kagan_2026.jpg', fx: .5, fy: .36, zoom: 1.55, tone: 'orig', credit: 'Ill. Niklas Elmehed © Nobel Prize Outreach' },
  soai: { file: 'nobel_ill_soai_2026.jpg', fx: .48, fy: .36, zoom: 1.55, tone: 'orig', credit: 'Ill. Niklas Elmehed © Nobel Prize Outreach' },
  both_ill: { file: 'nobel_ill_kagan_soai_2026.jpg', fx: .5, fy: .5, zoom: 1, tone: 'orig', credit: 'Ill. Niklas Elmehed © Nobel Prize Outreach' },
};
const ANNCREDIT = '';
const KANTEICREDIT = '出典：首相官邸ホームページ「ノーベル化学賞についての東京理科大学硤合名誉教授へのお祝いの電話」を加工して作成';
