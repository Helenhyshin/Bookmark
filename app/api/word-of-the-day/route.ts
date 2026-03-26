import { NextResponse } from 'next/server'

// Curated word list — interesting, useful words that reward learning.
// The day of the year determines which word is shown (deterministic, same for all users).
const WORDS = [
  'ephemeral', 'serendipity', 'ubiquitous', 'sanguine', 'mellifluous',
  'petrichor', 'luminous', 'enigma', 'resilient', 'cacophony',
  'quintessential', 'eloquent', 'ineffable', 'nefarious', 'ebullient',
  'aesthetic', 'labyrinthine', 'penumbra', 'soliloquy', 'reverie',
  'mercurial', 'ethereal', 'clandestine', 'paradox', 'zenith',
  'aplomb', 'benevolent', 'catalyst', 'diaphanous', 'evanescent',
  'felicity', 'gossamer', 'halcyon', 'iconoclast', 'juxtaposition',
  'kismet', 'limerence', 'mosaic', 'nebulous', 'oblivion',
  'palimpsest', 'querulous', 'raconteur', 'sublime', 'tangential',
  'unctuous', 'verisimilitude', 'wanderlust', 'xenial', 'yearning',
  'zeitgeist', 'acumen', 'brevity', 'conundrum', 'dalliance',
  'epiphany', 'fortitude', 'grandiloquent', 'harbinger', 'idyllic',
  'jubilant', 'kinetic', 'languish', 'maelstrom', 'nascent',
  'opulent', 'perspicacious', 'quixotic', 'ruminate', 'sagacious',
  'trepidation', 'umbrage', 'vicissitude', 'wistful', 'axiom',
  'bucolic', 'capricious', 'deft', 'ennui', 'furtive',
  'garrulous', 'hubris', 'incandescent', 'jocund', 'kaleidoscope',
  'laconic', 'magnanimous', 'nonchalant', 'ostensible', 'penchant',
  'quotidian', 'recalcitrant', 'surreptitious', 'tenacious', 'utilitarian',
  'venerable', 'whimsical', 'xeric', 'yielding', 'zealous',
  'abscond', 'bemused', 'cogent', 'deleterious', 'equanimity',
  'fastidious', 'gregarious', 'hegemony', 'impetuous', 'judiciously',
  'kindle', 'lugubrious', 'meticulous', 'nuance', 'obfuscate',
  'placid', 'quagmire', 'reticent', 'sycophant', 'truculent',
  'umbra', 'verbose', 'wraith', 'exacerbate', 'bifurcate',
  'circumlocution', 'diatribe', 'effervescent', 'frivolous', 'gratuitous',
  'hapless', 'insouciant', 'jejune', 'knell', 'loquacious',
  'munificent', 'nihilism', 'oblique', 'panacea', 'quiescent',
  'rapacious', 'soporific', 'tautology', 'usurp', 'veracity',
  'winsome', 'ambivalent', 'beguile', 'capitulate', 'debacle',
  'extemporaneous', 'flippant', 'gauche', 'histrionics', 'imbroglio',
  'jaunt', 'kowtow', 'litigious', 'mendacious', 'nondescript',
  'obsequious', 'parsimonious', 'quandary', 'redolent', 'sardonic',
  'tantalize', 'unequivocal', 'vivacious', 'anachronism', 'bellicose',
  'commensurate', 'diffident', 'erstwhile', 'facetious', 'grandeur',
  'hyperbole', 'intransigent', 'juxtapose', 'laudable', 'misanthrope',
  'nonpareil', 'oligarchy', 'perfunctory', 'recondite', 'spurious',
  'torpor', 'unilateral', 'voracious', 'wanton', 'auspicious',
  'bombastic', 'contrite', 'demure', 'esoteric', 'futile',
  'gratify', 'hermetic', 'ignominy', 'jettison', 'keen',
  'listless', 'morose', 'notoriety', 'opaque', 'pragmatic',
  'rebuke', 'stoic', 'taciturn', 'unconscionable', 'vindicate',
  'wane', 'abdicate', 'brusque', 'candor', 'defamation',
  'erudite', 'fervent', 'genteel', 'heresy', 'impunity',
  'jaded', 'kudos', 'lavish', 'magnate', 'notorious',
  'ostentatious', 'poignant', 'recant', 'scrupulous', 'terse',
  'usurious', 'visceral', 'wayward', 'acrimonious', 'blithe',
  'compendium', 'discordant', 'exonerate', 'flagrant', 'germane',
  'hedonism', 'implacable', 'jingoism', 'languid', 'mitigate',
  'neophyte', 'onerous', 'propensity', 'repudiate', 'solicitous',
  'transient', 'umbrageous', 'voluble', 'accolade', 'bourgeois',
  'circumspect', 'disdain', 'exigent', 'forbearance', 'harbinger',
  'ignominious', 'jurisprudence', 'liminal', 'maudlin', 'noxious',
  'palatable', 'querulent', 'resplendent', 'sibilant', 'truculent',
  'untenable', 'vacillate', 'whimsy', 'arduous', 'beleaguer',
  'clemency', 'desultory', 'excoriate', 'fecund', 'gratuitous',
  'harangue', 'impervious', 'jinx', 'lassitude', 'meander',
  'nomenclature', 'ossify', 'precipitous', 'remunerate', 'supercilious',
  'tribulation', 'uxorious', 'venerate', 'waif', 'apocryphal',
  'bluster', 'consternation', 'delineate', 'exuberant', 'fathom',
  'galvanize', 'heretofore', 'inexorable', 'jostle', 'luminescence',
]

function getTodaysWord(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  return WORDS[dayOfYear % WORDS.length]
}

export async function GET() {
  const word = getTodaysWord()

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      { next: { revalidate: 86400 } } // cache for 24 hours
    )

    if (!res.ok) {
      // Fallback: return the word without a definition
      return NextResponse.json({ word, definition: null, partOfSpeech: null, note: null })
    }

    const data = await res.json()
    const entry = data[0]
    const meaning = entry?.meanings?.[0]
    const def = meaning?.definitions?.[0]

    return NextResponse.json({
      word,
      definition: def?.definition ?? null,
      partOfSpeech: meaning?.partOfSpeech ?? null,
      note: def?.example ?? entry?.origin ?? null,
    })
  } catch {
    return NextResponse.json({ word, definition: null, partOfSpeech: null, note: null })
  }
}
