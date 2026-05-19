/**
 * Afirma E-vias — Brand Color Palette
 * Use these constants across all document generators and UI components.
 */

export const BRAND = {
  // Core palette
  navy:        '#00233B',   // Primary dark — headers, labels, text
  green:       '#566E3D',   // Forest green — accents, borders
  lightGreen:  '#BFCF99',   // Light green — table headers, badges
  cream:       '#F2F1EF',   // Cream — label backgrounds, row fills
  warmCream:   '#EFEBDC',   // Warm cream — page background

  // Typography
  fontHeader:  "'Exo 2', Arial, sans-serif",
  fontBody:    "'Poppins', Arial, sans-serif",

  // Semantic aliases
  sectionHeaderBg:    '#F2F1EF',
  sectionHeaderText:  '#000f',
  sectionHeaderBorder:'#00233B',

  tableHeaderBg:      '#BFCF99',
  tableHeaderText:    '#00233B',
  tableHeaderBorder:  '#bbb',

  labelBg:            '#F2F1EF',
  labelText:          '#00233B',
  labelBorder:        '#bbb',

  cellBorder:         '#bbb',
  footerText:         '#566E3D',
  footerBorder:       '#BFCF99',
};

/**
 * Returns inline styles for a section header bar (dark navy band).
 * Usage: style={BRAND_STYLES.sectionHdr()}
 */
export const BRAND_STYLES = {
  sectionHdr: (extra = {}) => ({
    textAlign: 'center',
    fontWeight: '800',
    fontSize: '9px',
    border: `1px solid ${BRAND.sectionHeaderBorder}`,
    borderBottom: 'none',
    padding: '3px',
    background: BRAND.sectionHeaderBg,
    color: BRAND.sectionHeaderText,
    fontFamily: BRAND.fontHeader,
    letterSpacing: '.5px',
    ...extra,
  }),

  tableHeader: (extra = {}) => ({
    background: BRAND.tableHeaderBg,
    color: BRAND.tableHeaderText,
    fontFamily: BRAND.fontHeader,
    fontWeight: '700',
    ...extra,
  }),

  labelCell: (extra = {}) => ({
    background: BRAND.labelBg,
    color: BRAND.labelText,
    fontFamily: BRAND.fontHeader,
    fontWeight: '700',
    border: `1px solid ${BRAND.cellBorder}`,
    padding: '3px 6px',
    whiteSpace: 'nowrap',
    ...extra,
  }),

  valueCell: (extra = {}) => ({
    border: `1px solid ${BRAND.cellBorder}`,
    padding: '3px 8px',
    fontFamily: BRAND.fontBody,
    ...extra,
  }),

  footer: (extra = {}) => ({
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: `1px solid ${BRAND.footerBorder}`,
    paddingTop: '4px',
    fontSize: '7px',
    color: BRAND.footerText,
    fontFamily: BRAND.fontHeader,
    ...extra,
  }),
};

/**
 * CSS string snippet for injecting brand styles into standalone HTML documents
 * (used in buildXxxHtml functions that generate a full <style> block).
 */
export const BRAND_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@600;700;800&family=Poppins:wght@400;500&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Poppins', Arial, sans-serif; font-size:9px; color:#000; background:${BRAND.warmCream}; padding:20px; }
  .sec-hdr {
    text-align:center; font-weight:800; font-size:9px;
    border:1px solid ${BRAND.sectionHeaderBorder}; border-bottom:none;
    padding:3px; background:${BRAND.sectionHeaderBg};
    color:${BRAND.sectionHeaderText}; font-family:${BRAND.fontHeader}; letter-spacing:.5px;
  }
  th {
    background:${BRAND.tableHeaderBg}; color:${BRAND.tableHeaderText};
    font-weight:700; font-family:${BRAND.fontHeader};
    border:1px solid ${BRAND.tableHeaderBorder};
  }
  td { font-family:${BRAND.fontBody}; }
  td.lbl {
    background:${BRAND.labelBg}; font-weight:700;
    font-family:${BRAND.fontHeader}; color:${BRAND.labelText};
    border:1px solid ${BRAND.cellBorder};
  }
  .doc-footer {
    display:flex; justify-content:space-between;
    border-top:1px solid ${BRAND.footerBorder}; padding-top:4px;
    font-size:7px; color:${BRAND.footerText}; font-family:${BRAND.fontHeader};
  }
  .top-bar { width:794px; margin:0 auto 12px auto; display:flex; align-items:center; justify-content:space-between; background:${BRAND.navy}; border-radius:8px; padding:12px 18px; box-shadow:0 1px 4px rgba(0,0,0,0.18); }
  .top-bar-title { font-weight:700; color:${BRAND.lightGreen}; font-size:15px; font-family:${BRAND.fontHeader}; }
  .top-bar-btn { display:inline-flex; align-items:center; gap:6px; background:${BRAND.green}; color:#fff; border:none; border-radius:6px; padding:7px 16px; font-size:12px; font-weight:600; cursor:pointer; font-family:${BRAND.fontHeader}; }
  .top-bar-btn svg { width:15px; height:15px; }
  .doc { width:794px; min-height:1123px; background:#fff; padding:8px 12px; margin:0 auto; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
  @media print { body { background:#fff; padding:0; } .top-bar { display:none; } .doc { box-shadow:none; } }
`;