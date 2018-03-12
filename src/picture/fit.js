const
  fit_opentype = (font, fontSize, maxWidth) =>  string =>
    font.getAdvanceWidth(string, fontSize) > maxWidth;
  //fit = (ctx, maxWidth) =>  string =>
  //  ctx.measureText(string).width > maxWidth;

window.fit = fit_opentype
