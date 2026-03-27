export function normaliseName(name: string | null | undefined): string | null {
    if (!name) return null;

    let s = name.normalize('NFKC').trim();

    // „TEXT” «TEXT» “TEXT” ‟TEXT‟ => "TEXT"
    s = s.replace(/[„”«»“”‟]/g, '"');

    //  ,,TEXT,, ''TEXT'' => "TEXT"
    s = s.replace(/,,/g, '"');
    s = s.replace(/''/g, '"');

    // ""TEXT"" => "TEXT"
    s = s.replace(/"{2,}/g, '"');

    // ‘TEXT’ -> 'TEXT'
    s = s.replace(/[’`´]/g, "'");

    // '-TEXT', '— TEXT' -> ' - TEXT'
    s = s.replace(/\s*[-–—]\s*/g, ' - ');

    // ', , TEXT, , ' -> 'TEXT'
    s = s.replace(/,\s*,+/g, ',');
    s = s.replace(/\s*,\s*/g, ', ');

    // ' ( TEXT ) ' -> '(TEXT)'
    s = s.replace(/\s+/g, ' ');

    // 'TEXT"TEXT' -> 'TEXT "TEXT'
    s = s.replace(/([0-9A-Za-zА-Яа-я])"/g, '$1 "');
    s = s.replace(/"([0-9A-Za-zА-Яа-я])/g, '" $1');
    s = s.replace(/\s+/g, ' ');

    // '" text "' -> '"text"'
    s = s.replace(/"\s*([^"\n]+?)\s*"/g, '"$1"');

    s = s.replace(/^[\s,]+|[\s,]+$/g, '');

    return s.length ? s : null;
}
