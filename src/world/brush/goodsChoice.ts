import { rememberStyle, STYLE_NAMES, STYLES, type Goods } from './goods.ts';

// The goods' look candidates on the page (#203's look PR, removed with the candidates once the developer picks): a button
// that says which is shown and steps to the next, as `?goods=a|b|c` does. It joins the HUD's own row of panel buttons
// (Ledger, Routes, Power…, top right); the HUD is built just after the scene, so it looks for that row a moment later.

export function goodsChoice(goods: Goods) {
  const b = document.createElement('button');
  b.className = 'cd-panelbtn goods-choice';
  const label = () => { b.textContent = `Goods: ${STYLE_NAMES[goods.style]}`; };
  label();
  b.title = `How the goods in trucks look (${STYLES.map((s) => STYLE_NAMES[s]).join(' / ')}): click for the next`;
  b.onclick = () => {
    const next = STYLES[(STYLES.indexOf(goods.style) + 1) % STYLES.length];
    goods.restyle(next);
    rememberStyle(next);
    label();
  };
  setTimeout(() => {
    const row = document.querySelector('.hud-top .panels');
    if (row) { row.append(b); return; }
    // No HUD row (it changed shape): in the top's middle instead.
    Object.assign(b.style, { position: 'fixed', left: '50%', top: '28px', transform: 'translateX(-50%)', zIndex: '50' });
    document.body.append(b);
  });
}
