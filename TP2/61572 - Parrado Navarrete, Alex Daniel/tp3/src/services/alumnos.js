export function parseVcf(text) {
  const cards = text.split('END:VCARD');
  return cards
    .map(card => {
      const fn = card.match(/FN:(.+)/)?.[1]?.trim() || '';
      const tel = card.match(/TEL;TYPE=CELL:(.+)/)?.[1]?.trim() || '';
      const note = card.match(/NOTE:(.+)/)?.[1]?.trim() || '';
      let legajo = '';
      let github = '';
      if (note) {
        const legajoMatch = note.match(/Legajo:\s*(\d+)/);
        if (legajoMatch) legajo = legajoMatch[1];
        const githubMatch = note.match(/Github:\s*([A-Za-z0-9-]+)/);
        if (githubMatch) github = githubMatch[1];
      }
      if (!fn || !legajo) return null;
      return {
        id: legajo,
        nombre: fn,
        telefono: tel,
        legajo,
        github,
        favorito: false,
      };
    })
    .filter(Boolean);
}