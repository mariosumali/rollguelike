export interface CodexLore {
  epigraph?: string;
  paragraphs: string[];
}

export interface BaubleLoreGroup extends CodexLore {
  id: string;
  title: string;
  itemIds: string[];
  note: string;
}

const chain = (epigraph: string, ...paragraphs: string[]): CodexLore => ({
  epigraph,
  paragraphs,
});

export const WARDEN_LORE: Record<string, CodexLore> = {
  facelocker: chain(
    'From the Black Threshold writ, sealed in wax and tooth.',
    'The first warden bears no crown, only keys. Some are iron, some bone, and some were cut from dice faces that failed their masters. It waits where every true descent begins, listening for the face a wanderer trusts most.',
    'A clerk of the West Vault wrote that the Lockkeeper does not bind chance. It binds habit. The clerk was found folded inside his own ledger, still clutching a receipt stamped with a single black pip.',
    'When its chain falls, the House grows quiet enough to hear the Forge breathing below the floorboards. Many mistake that silence for mercy.',
  ),
  splitterqueen: chain(
    'A nursery hymn scratched under a gaming table.',
    'Broodmother Ante came first as a wager and then as a widow. The tale says a queen of the Underfelt laid one egg for every debt her children inherited, and by dawn the nursery floor was crawling with pips.',
    'Her brood do not hatch from shell but from promise. Each little rat carries a bad outcome in its teeth, and each larva splits like a lie told twice in the same court.',
    'The Red Pilgrim claimed to have seen her bow before a cracked pane from the Mirror Court. The pilgrims after him crossed that line from their maps.',
  ),
  mirrortwin: chain(
    'Copied from a page whose ink moved when watched.',
    'The Glass Twin is the House keeping a receipt for valor. It wears the shape of a brave choice after the courage has been scraped away, and sends the deed back with malice stitched into it.',
    'Old duelists say it was born when Excalibur struck the Mirror Court and one pane refused to break cleanly. The shard learned the outline of the hand that wounded it, and has practiced imitation ever since.',
    'If it shows your last face, do not admire the likeness. Mirrors in the House are never portraits. They are warrants.',
  ),
  nullzone: chain(
    'A dealer prayer from the Null Table, spoken without breath.',
    'The Null Croupier deals from a table where winning shots become nothing. Its sleeves are lined with missing arrows, drowned sparks, and the little prayers warriors whisper after they have already fired.',
    'Some call it a servant of the void. The bell-widow of Ash Chapel called it a bookkeeper, for it never destroys a thing without entering the loss somewhere beneath the felt.',
    'The ninth croupier once challenged it with a gilded die. The die landed, showed no face, and still owed interest.',
  ),
  invertking: chain(
    'From the fool-king sermon, banned in three courts.',
    'The Invert King conquered his corner of the House by proving every six contains a one. His crown turns because law turns with it, and every noble pip kneels when he declares the lowly royal.',
    'He keeps jesters, apostles, and number-priests in his train. They count sins upward, blessings downward, and laugh when a learned hand reaches for the face it thought it knew.',
    'A debtor-knight broke his rhythm once by casting blind. The King praised the act, then hanged the memory of it in the Court for all future fools to study.',
  ),
  reflectorboss: chain(
    'A confession etched backward on mirrorplate.',
    'The Mirror Warden is not a guard but a judgment. Every accusation sent toward it returns wearing armor, and every careless volley becomes testimony against the hand that loosed it.',
    'Bailiffs polish its shell with filings from old shields. The Aegis is named in their muttering with envy, for bronze that protects without spite is an offense to the Mirror Court.',
    'Those who beat the Warden report no triumph. They speak instead of seeing themselves in the cracked helm, older by one sin and poorer by one certainty.',
  ),
};

export const RELIC_LORE: Record<string, CodexLore> = {
  relic_excalibur: chain(
    'No chapel claims the blade, though three have burned for doing so.',
    'In the old songs Excalibur was borne by a debtor-knight who entered the House with no coin, no retinue, and a die whose sixth face had been rubbed smooth by prayer. When the blade woke, it shone like dawn seen through a prison slit.',
    'The Mirror Court keeps a cracked pane said to have caught its stroke and failed to return it. Since then, mirror-born wardens lower their helms when the sixth cast rings true.',
    'The House calls the sword stolen. The Forge calls it remembered.',
  ),
  relic_holy_grail: chain(
    'A cup for the wound that has not happened yet.',
    'The Holy Grail was hidden in Ash Chapel after the bell-widow poured her last breath into it. It does not grant life freely. It saves a life already judged useful by some mercy older than the House.',
    'Pilgrims who drank from it woke beneath shields of pale gold, hearing distant bells count debts that had been delayed but not forgiven. The surgeons of the House hate the cup most of all, for it mends without stitch or invoice.',
    'One record says the Grail was once carried beside Excalibur. Another says the sword only grew bright because the cup had first learned how to keep hope warm.',
  ),
  relic_mjolnir: chain(
    'Thunder remembers every blow, even those the wielder forgets.',
    'Mjolnir fell into the House through a rent above the Storm Gallery and refused to lie still. Each strike wakes the old storm in its head until the air tastes of coin and iron.',
    'Vaultbacks turn their locks inward when it hums. Tin antennae twitch in junk drawers. The Null Croupier sweeps its table twice, for lightning is hard to erase once it has learned a name.',
    'A child of the West Vault claimed thunder is not sound but oath. The hammer proves him right whenever the chain begins.',
  ),
  relic_aegis: chain(
    'A shield old enough to shame the mirror.',
    'Aegis was beaten from bronze under a moon that did not wish to be seen. It blocks not because it is thick, but because it remembers standing before monsters when men still had kings worth guarding.',
    'The Mirror Warden covets its plain courage. Guardian rims are lesser copies hammered by nervous smiths who heard the tale and mistook the moral for a recipe.',
    'When Aegis turns a wound aside, the House pauses. It is unused to refusals spoken so quietly.',
  ),
  relic_philosophers_stone: chain(
    'Every coin dreams of becoming a weapon.',
    'The Philosopher\'s Stone was made in the West Vault by an alchemist who could not tell greed from hunger. He fed it copper, then silver, then the names of his creditors, and at last it began to turn payment into power.',
    'Gilded crumbs are said to flake from its casing when the Forge grows warm. Gamblers kiss those crumbs before a risky cast, though the wise wipe their mouths afterward.',
    'The stone does not love wealth. It merely understands that the House built a throne from owing, and any throne may be melted down.',
  ),
  relic_necronomicon: chain(
    'A book that writes enemies into itself.',
    'The Necronomicon was bound in the Grave Library from pages that had already been buried. Its ink is patient. It waits for a death, opens like a wound, and records the shape that made the dying thing afraid.',
    'Necromancers say the book does not summon wraiths. It calls witnesses. Bone legions march straighter when its cover stirs, and grave ushers lower their bells as though passing a magistrate.',
    'The last owner left one warning: never read aloud the line that has begun writing your own hand.',
  ),
  relic_gungnir: chain(
    'A spear that refuses the mercy of distance.',
    'Gungnir was carried through the Frost-Rung Belfry by a saint whose name has been pecked out of every hymn. The spear did not miss because it did not travel toward bodies. It traveled toward guilt.',
    'Marked enemies feel it before it flies. Executioners learned their craft from the wound it leaves, and even the Six-Seal Guard opens a fraction when the spear has named a target.',
    'In the House, certainty is rarer than gold. Gungnir is certainty with a point.',
  ),
  relic_yata_mirror: chain(
    'A sacred reflection of the last choice fate made.',
    'The Yata Mirror was polished in a shrine with no door. It shows not the viewer, but the decision that stands behind the viewer with one hand raised.',
    'The Glass Twin hates it as a bastard hates a lawful heir. Where the Twin copies hunger, Yata repeats intention, turning defense into ward and attack into omen.',
    'A court scribe wrote that the mirror once reflected the House itself. The page after that is blank, save for a thumbprint in silver dust.',
  ),
};

export const FACE_CHAIN_LORE: Record<string, CodexLore> = {
  aegis: chain('From the bronze marginalia of Ash Chapel.', 'Aegis marks were first cut onto shield-faces by monks who had forgotten every prayer except refusal.', 'When the third mark blooms, the die holds itself like old bronze before a mirror judge.'),
  all_in: chain('A gambler psalm, usually sung too late.', 'All In was born at the Null Table when a pilgrim wagered his safest face and smiled as though safety had insulted him.', 'By the time the cast becomes Jackpot, even the House leans closer, greedy enough to forget caution.'),
  aqua_bolt: chain('A tide recorded beneath dry floorboards.', 'Aqua Bolt came from a drowned chapel where the Grail was once hidden under rushes.', 'Its highest tide leaves small mercies in its wake, and wounded travelers follow them like moonlit stepping stones.'),
  arc_bolt: chain('Storm-script copied from a tin reliquary.', 'Arc Bolt was the first lesson the Storm Gallery taught the Forge: lightning prefers company.', 'At full rite, the bolt reads a room like a family tree and names every branch in fire-white ink.'),
  bastion_bolt: chain('A knightly writ from the West Gate.', 'Bastion Bolt was made for sentries who had no wall left except the face of a die.', 'Its final oath stands between the caster and the rush, as calm as Aegis and less forgiving.'),
  black_hole: chain('A note swallowed by its own signature.', 'Black Hole is what remains when the Null Table is asked to keep still.', 'The last form draws servants inward as if the Underfelt has opened a hungry eye.'),
  blade_dance: chain('A duelist account written in cuts.', 'Blade Dance began as footwork taught in the Mirror Court, where every missed step became another opponent.', 'When mastered, the blades move before the hand admits it has chosen violence.'),
  bloodrush: chain('A red lesson from the berserker cloister.', 'Bloodrush was carved into axe-faces by warriors who believed pain was a bell.', 'Its final cry sounds like victory only to those already near death.'),
  bolt: chain('The oldest straight line in the Forge.', 'Bolt is humble only to those who have never needed one clean shot before the wall.', 'Its third name is spoken by soldiers who trust a single path more than any miracle.'),
  bone_legion: chain('Roll-call from the Grave Library.', 'Bone Legion remembers every small skeleton swept under the gaming tables.', 'When the legion is whole, even the House counts its dead twice.'),
  boomerang: chain('A returning oath from the red corridor.', 'Boomerang was cut for adventurers who could not afford to waste a miss.', 'At its height the blade comes home with news from every throat it visited.'),
  burn_tip: chain('A candle-rite from Ash Chapel.', 'Burn Tip is the smallest fire the House has failed to tax.', 'The last ember clings like a verdict, bright enough to make soot buttons seem noble.'),
  chill_tip: chain('A needle from the Frost-Rung Belfry.', 'Chill Tip began as a tailor\'s trick for sewing winter into cloth.', 'The final stitch can still a servant long enough for the bell to forget its next beat.'),
  conductive_tip: chain('Copper gossip from the Storm Gallery.', 'Conductive Tip was made when a smith wrapped a die face in wire and waited for thunder to answer.', 'By Live Wire, the answer arrives before the question is done sparking.'),
  crit_edge: chain('A thin doctrine from the Mirror Court.', 'Crit Edge is the art of finding where armor has lied about being whole.', 'Its finest cut needs no anger, only a little light and an unforgiving hand.'),
  dragon_fang: chain('A furnace tooth sealed in black wax.', 'Dragon Fang is said to be chipped from a beast sleeping under the Hellfire Furnace.', 'At full bite, the old heat remembers wings no living servant has seen.'),
  echo: chain('A second voice under the floor.', 'Echo came from the Underfelt, where lost casts repeat until someone mistakes them for prophecy.', 'The final echo does not copy the roll. It answers it.'),
  echo_chamber: chain('A hollow charm from the bell-widow.', 'Echo Chamber was built for faces that wished to be heard twice.', 'In its deepest hollow, even the House cannot tell which strike was first.'),
  elemental_brand: chain('A seal from the alchemist\'s black ledger.', 'Elemental Brand was pressed onto dice by hands stained with four colors of sin.', 'The perfected brand does not choose an element; it remembers which one the room fears most.'),
  ember: chain('A coal kept beneath a pilgrim tongue.', 'Ember is a little Ash Chapel fire, carried by those too poor for a relic.', 'Its last glow makes a battlefield look briefly like a hearth, then punishes the comfort.'),
  executioner: chain('A hooded margin in the court records.', 'Executioner was first taught to a debtor who asked how much wound was enough.', 'Reaper\'s Mark answers with silence, and the marked rarely hear the answer twice.'),
  extra_shot: chain('A surplus blessing from the Forge bins.', 'Extra Shot is the kind of small abundance that ruins careful ledgers.', 'At its fullest, the die spits enough iron to make a clerk miscount on purpose.'),
  fire_bolt: chain('A red line out of Ash Chapel.', 'Fire Bolt was kindled from a candle that burned during a rain of coins.', 'When it becomes Inferno, even Vaultbacks glow through their seams.'),
  flame_geyser: chain('A well under the Hellfire Furnace.', 'Flame Geyser rises from cracks the House tiled over and prayed would cool.', 'The third eruption sounds like old masonry confessing.'),
  frost_lance: chain('The minute hand that froze at the Belfry.', 'Frost Lance was grown above a winter font by a clockmaker who wished time would limp.', 'Absolute Zero is not cold. It is stillness with a spear through it.'),
  frostwake: chain('Footprints in a chapel frost.', 'Frostwake follows shots like a pilgrim following blood across snow.', 'By the last rite, every trail becomes a little road to the Frost-Rung Belfry.'),
  glacier_field: chain('A field report from a war no thaw remembers.', 'Glacier Field was sown with blue salt after a saint lost his army but kept the ground.', 'The final field does not hold enemies back. It convinces them they have already stopped.'),
  gold_bite: chain('A merchant curse from the West Vault.', 'Gold Bite began as a coin with teeth pressed into a die face.', 'When the bite is deep enough, the House pays out like a wounded purse.'),
  grave_contract: chain('A bargain signed below the name.', 'Grave Contract promises aid only after the signer admits tomorrow is negotiable.', 'At full seal, the dead collect on clauses the living never read.'),
  gravity_well: chain('A cup turned upside down at the Null Table.', 'Gravity Well is a polite name for hunger with manners.', 'The seed it becomes pulls servants together as though the House itself is drawing breath.'),
  greater_heal: chain('A basin hidden behind Ash Chapel.', 'Greater Heal remembers the Grail in poor materials: water, copper, and stubborn hope.', 'At its fountain form, even spilled mercy returns wearing a shield.'),
  guardian_rim: chain('Bronze filings from a shieldmaker\'s floor.', 'Guardian Rim was made by smiths who loved Aegis but could not steal its age.', 'The rim grows wiser by the third engraving, and danger sees itself turned aside.'),
  homing_missile: chain('A hunter\'s prayer tied to a dart.', 'Homing Missile follows not scent but unfinished business.', 'Its final name curves through crowds like Gungnir after a lesser education.'),
  kindling_core: chain('A coal placed where a heart should be.', 'Kindling Core keeps a little furnace inside a die face.', 'When it matures, every fire around it behaves like kin called to supper.'),
  lance: chain('A cavalry oath without the horse.', 'Lance was made for straight courage and narrow halls.', 'By the third name, it passes through ranks as if the first enemy was only a door.'),
  loaded_jackpot: chain('A song from the ninth croupier.', 'Loaded Jackpot is luck with its sleeves rolled up.', 'At the final cast the House smiles too, which is how gamblers know to fear it.'),
  lucky_coin: chain('A bent coin from a saintless shrine.', 'Lucky Coin lands on its edge in stories and in the hands of liars.', 'When polished to its highest lie, it convinces the die that fortune was always owed.'),
  overclocked_spring: chain('A spring stolen from the Clockmaker\'s chest.', 'Overclocked Spring winds haste into the rim until patience snaps.', 'At full tension, even the House hears time complain.'),
  overwatch: chain('A watchman\'s vow from a broken battlement.', 'Overwatch was made for knights who slept in armor and trusted the sixth bell.', 'Full Overwatch keeps firing after fear has already looked away.'),
  piercing_core: chain('An awl blessed in the West Vault.', 'Piercing Core was designed to make doors ashamed of being closed.', 'The final point carries each shot through ranks like a writ through soft wax.'),
  poison_dart: chain('A green thorn from the undergarden.', 'Poison Dart was sold by apothecaries who never survived their own cures.', 'At its third sting, the wound blooms with patient arithmetic.'),
  prism_ray: chain('Light taught to hold a grudge.', 'Prism Ray was born from a sliver of the cracked Mirror Court pane.', 'Rainbow Lance is what happens when color decides every servant owes it blood.'),
  pulse_nova: chain('A bell rung under the skin of the room.', 'Pulse Nova began as a chapel bell too small to hang and too angry to bury.', 'Supernova rings twice, and the second sound arrives carrying the first one\'s debt.'),
  quantity: chain('A clerk\'s nightmare, filed in triplicate.', 'Quantity is the Forge laughing at tidy ledgers.', 'The last copy arrives with so many siblings that even the House stops counting.'),
  rage_cyclone: chain('A red dance from the axe pits.', 'Rage Cyclone turns wrath into weather.', 'At full storm, the berserker does not swing the axe; the room does.'),
  reaction_mastery: chain('A scholar\'s burn mark in four colors.', 'Reaction Mastery was written by an alchemist who believed elements were gossiping nobles.', 'The final formula makes fire, frost, venom, and lightning accuse one another in public.'),
  ricochet: chain('A court trick learned from thrown buttons.', 'Ricochet was favored by duelists who fought in rooms too crowded for honor.', 'The master shot leaves angles behind like breadcrumbs.'),
  ring_of_fangs: chain('A circle drawn in salt and tooth.', 'Ring of Fangs was first laid around a sleeping pilgrim in the Underfelt.', 'The final ring bites outward and inward, uncertain which side holds the monster.'),
  shrapnel: chain('A bomb-maker\'s confession in brass.', 'Shrapnel was invented after one clean hit proved insufficiently rude.', 'At its cruelest, every broken piece believes itself the original blade.'),
  shotgun_blast: chain('A door-kicker charm from the West Gate.', 'Shotgun Blast was made for work too close for prayers.', 'When the pellets remember one another and become Slug, armor learns humility.'),
  solar_lance: chain('A sunbeam smuggled through Ash Chapel glass.', 'Solar Lance bears the warmth Excalibur leaves on old stones.', 'At zenith, it crosses the field like judgment arriving at noon.'),
  soul_harvest: chain('A sickle kept in the Grave Library.', 'Soul Harvest gathers what the House drops between deaths.', 'By the final reaping, even the Necronomicon closes a page in respect.'),
  spirit_echo: chain('A whisper returned from an empty chair.', 'Spirit Echo is cast by those who have more witnesses than allies.', 'At its height, the echo takes shape long enough to make loneliness dangerous.'),
  starlight_rim: chain('A rim of night hammered at the Belfry roof.', 'Starlight Rim gives wandering shots a constellation to obey.', 'When complete, the little stars circle like fangs taught astronomy.'),
  std_shot: chain('The common soldier\'s catechism.', 'Standard Shot is the plainest entry in the Forge book and therefore the most trusted.', 'Volley is no miracle. It is discipline repeated until the House yields space.'),
  tempest_strike: chain('A storm writ nailed to the chapel door.', 'Tempest Strike calls down weather with the manners of a court summons.', 'The last strike arrives attended by thunder that has already chosen defendants.'),
  tesla_orb: chain('A glass heart from the Storm Gallery.', 'Tesla Orb floats because lightning has never respected floors.', 'The final orb circles like a saint\'s relic possessed by very impolite thunder.'),
  thunderstrike: chain('A tall mark burned through the roof beams.', 'Thunderstrike is the vertical law of Mjolnir written in poorer ink.', 'Zeus\'s Wrath names the same foe twice, lest the first command be mistaken for weather.'),
  time_snare: chain('A noose made from a clock hand.', 'Time Snare was the Clockmaker\'s first sin, hidden in the Frost-Rung Belfry.', 'At full knot, the caught servant hears tomorrow pass without it.'),
  toxic_payload: chain('A sealed vial from the undergarden carts.', 'Toxic Payload was made for those who prefer their malice delivered late.', 'The final flask breaks like a secret that has waited too long.'),
  transmute: chain('An alchemist note written over a royal tax law.', 'Transmute teaches a face to become what the room demands and what the House forbids.', 'At the third proof, even gold and venom exchange masks.'),
  vampiric_tip: chain('A needle blessed by no saint.', 'Vampiric Tip drinks from the wound and calls the theft nursing.', 'When perfected, it leaves the enemy pale and the wielder ashamed but standing.'),
  venom_bloom: chain('A flower cultivated under the gaming table.', 'Venom Bloom opens where old poisons were spilled and never apologized for.', 'Its last blossom perfumes the room until every breath becomes a wager.'),
  volatile_core: chain('A cracked engine from the Hellfire Furnace.', 'Volatile Core is a heart that resents staying whole.', 'At full fracture, the blast sounds like a furnace remembering its dragon.'),
  volatile_mixture: chain('A flask recipe with the last line burned away.', 'Volatile Mixture was outlawed by alchemists, which made adventurers trust it more.', 'The perfected mix does not explode by accident. It chooses the dramatic hour.'),
};

export const BAUBLE_LORE_GROUPS: BaubleLoreGroup[] = [
  {
    id: 'rime-scraps',
    title: 'Rime Scraps',
    itemIds: ['bauble_glass_burr', 'bauble_rime_coin'],
    note: 'Frozen trifles',
    epigraph: 'Junk from the Mirror Court after winter judgment.',
    paragraphs: [
      'Glass Burrs are swept from the floor after the Mirror Court holds judgment in winter. Rime Coins are older, minted in a duchy whose treasury froze before its king could pay the House.',
      'Many a nameless adventurer has lived by such scraps. One account tells of a woman with no relic, no blessing, and only a burr beneath her tongue when the brood came over the table edge.',
    ],
  },
  {
    id: 'belfry-ice',
    title: 'Belfry Ice',
    itemIds: ['bauble_snowmelt_pin', 'bauble_icicle_lens'],
    note: 'Cold measures',
    epigraph: 'Small instruments from the Frost-Rung Belfry.',
    paragraphs: [
      'Snowmelt Pins were made to fasten shrouds around bells that would not stop ringing. Icicle Lenses were ground from the same frost and show the exact place a frozen thing will break.',
      'Clockmakers trade them in whispers, for the House dislikes tools that make patience sharp.',
    ],
  },
  {
    id: 'green-sewing',
    title: 'Green Sewing',
    itemIds: ['bauble_venom_thimble', 'bauble_mold_button'],
    note: 'Poison notions',
    epigraph: 'A seamstress of the undergarden kept these in her mouth.',
    paragraphs: [
      'The Venom Thimble and Mold Button are humble tailor\'s tools, if the tailor works in rot and the cloth is living skin.',
      'They appear often in stories of apothecaries who promised cures to the House Surgeon and delivered slower deaths instead.',
    ],
  },
  {
    id: 'toad-and-thread',
    title: 'Toad and Thread',
    itemIds: ['bauble_toadstool_cap', 'bauble_viper_thread'],
    note: 'Venom heirlooms',
    epigraph: 'Two keepsakes from a garden without sun.',
    paragraphs: [
      'A Toadstool Cap marks a pact with damp earth. A Viper Thread marks one with things that move beneath it.',
      'The Red Pilgrim wrote that poison is the only courtier patient enough to outwait a warden.',
    ],
  },
  {
    id: 'ash-buttons',
    title: 'Ash Buttons',
    itemIds: ['bauble_ember_bead', 'bauble_soot_button'],
    note: 'Low fire charms',
    epigraph: 'Ash Chapel sells no relic cheaply, but its sweepings travel.',
    paragraphs: [
      'Ember Beads are rolled from chapel soot and sinner\'s wax. Soot Buttons are sewn onto coats worn too close to the furnace doors.',
      'Children of the House learn early that little fires are safer than great ones only until they gather.',
    ],
  },
  {
    id: 'cinder-glass',
    title: 'Cinder Glass',
    itemIds: ['bauble_cinder_locket', 'bauble_coal_lens'],
    note: 'Burning keepsakes',
    epigraph: 'A lover\'s token and a judge\'s lens, both blackened.',
    paragraphs: [
      'The Cinder Locket holds a pinch of funeral flame. The Coal Lens lets that flame choose where to bite.',
      'Some say they were gifts between a furnace stoker and a mirror bailiff, which would explain why both burn and judge at once.',
    ],
  },
  {
    id: 'storm-junk',
    title: 'Storm Junk',
    itemIds: ['bauble_tin_antenna', 'bauble_copper_knot'],
    note: 'Conductive refuse',
    epigraph: 'Bent metal from the Storm Gallery gutters.',
    paragraphs: [
      'Tin Antennae are nailed to hats by fools who wish to hear thunder before it arrives. Copper Knots are tied by wiser fools who want the thunder to stay.',
      'Mjolnir makes such scraps sing when it passes, though the hammer never slows to listen.',
    ],
  },
  {
    id: 'static-moon',
    title: 'Static Moon',
    itemIds: ['bauble_static_pebble', 'bauble_moonlit_die_chip'],
    note: 'Bright fragments',
    epigraph: 'Pebble and pip from a storm under moonlight.',
    paragraphs: [
      'Static Pebbles come from walls struck too often by chain lightning. Moonlit Die Chips are shaved from dice left on chapel windowsills.',
      'Together they make a small weather, the sort that gathers around arcane faces before anyone has admitted a spell was cast.',
    ],
  },
  {
    id: 'projectile-trinkets',
    title: 'Projectile Trinkets',
    itemIds: ['bauble_bent_needle', 'bauble_feather_fletching'],
    note: 'Straight-flight charms',
    epigraph: 'Cheap tools beloved by poor soldiers.',
    paragraphs: [
      'A Bent Needle teaches a shot spite. Feather Fletching teaches it haste.',
      'The debtor-knight carried both before he ever found a blade worth naming, and his earliest victories were ugly, quick, and sufficient.',
    ],
  },
  {
    id: 'marble-and-lens',
    title: 'Marble and Lens',
    itemIds: ['bauble_cracked_marble', 'bauble_brass_lens'],
    note: 'Aim curios',
    epigraph: 'Playthings from ruined nurseries of the House.',
    paragraphs: [
      'Cracked Marbles enlarge what should have stayed small. Brass Lenses reveal what should have stayed hidden.',
      'Many children of the Underfelt learned marksmanship by losing games with these, then surviving the tantrums that followed.',
    ],
  },
  {
    id: 'spring-and-bell',
    title: 'Spring and Bell',
    itemIds: ['bauble_spare_spring', 'bauble_bell_shard'],
    note: 'Time and pulse',
    epigraph: 'The Clockmaker and the bell-widow both deny ownership.',
    paragraphs: [
      'A Spare Spring keeps a shot alive past its appointed breath. A Bell Shard carries a little chapel thunder in its broken edge.',
      'The Frost-Rung Belfry trades both under cloth, because the House has ears in every clock and every bell.',
    ],
  },
  {
    id: 'prism-and-spur',
    title: 'Prism and Spur',
    itemIds: ['bauble_glass_prism', 'bauble_rusty_spur'],
    note: 'Beam and orbit',
    epigraph: 'A bright shard and a riderless goad.',
    paragraphs: [
      'Glass Prisms are cousins to the Mirror Court shard, though less proud and easier to carry. Rusty Spurs are found near chairs where no rider ever sat.',
      'One bends light into accusation. The other teaches circling things to kick.',
    ],
  },
  {
    id: 'anvil-and-splinter',
    title: 'Anvil and Splinter',
    itemIds: ['bauble_tiny_anvil', 'bauble_lucky_splinter'],
    note: 'Low-cast tools',
    epigraph: 'Forge sweepings from a day of bad rolls.',
    paragraphs: [
      'Tiny Anvils ring when a strike descends. Lucky Splinters hide inside low pips and make poverty look briefly like cunning.',
      'The Forge keeps bins of such things for adventurers who arrive brave and underfunded.',
    ],
  },
  {
    id: 'nail-and-fang',
    title: 'Nail and Fang',
    itemIds: ['bauble_sixpence_nail', 'bauble_salted_fang'],
    note: 'High-cast trophies',
    epigraph: 'One for the high face, one for the high prey.',
    paragraphs: [
      'Sixpence Nails are hammered through dice that rolled high at funerals. Salted Fangs are taken from beasts that bit wardens and died proud.',
      'Hunters pin them inside gloves before facing the Mirror Warden, though most deny the superstition until asked to remove them.',
    ],
  },
  {
    id: 'blood-and-bandage',
    title: 'Blood and Bandage',
    itemIds: ['bauble_blooddrop_bead', 'bauble_threadbare_bandage'],
    note: 'Wound relics',
    epigraph: 'Two mercies that smell faintly of iron.',
    paragraphs: [
      'Blooddrop Beads darken when courage is almost spent. Threadbare Bandages remember every hand that tied them and every wound that reopened anyway.',
      'The Holy Grail makes these charms seem crude, but crude things often reach a dying traveler first.',
    ],
  },
  {
    id: 'pin-and-crumb',
    title: 'Pin and Crumb',
    itemIds: ['bauble_safety_pin', 'bauble_gilded_crumb'],
    note: 'Poor defenses',
    epigraph: 'A fastened cloak and a meal of gold dust.',
    paragraphs: [
      'Safety Pins fasten small courage to smaller armor. Gilded Crumbs fall from purses that have learned the Philosopher\'s Stone by rumor.',
      'No knight boasts of either, but many living knights have checked their cloak and purse before boasting of anything else.',
    ],
  },
  {
    id: 'seed-and-whetstone',
    title: 'Seed and Whetstone',
    itemIds: ['bauble_clockwork_seed', 'bauble_whetstone_chip'],
    note: 'Last refinements',
    epigraph: 'A time-kernel and a blade-bit from the Forge floor.',
    paragraphs: [
      'Clockwork Seeds tick even in sealed pockets. Whetstone Chips sharpen whatever hand is desperate enough to rub them bloody.',
      'The ninth croupier called them honest cheats: one steals a little time, the other teaches every wound to count.',
    ],
  },
];
