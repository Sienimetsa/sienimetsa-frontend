const mushroomPictureMap = {
    'Agaricus arvensis': require('../assets/mushroom-photos/Agaricus-arvensis.png'),
    'Agaricus augustus': require('../assets/mushroom-photos/Agaricus-augustus.png'),
    'Agaricus bisporus': require('../assets/mushroom-photos/Agaricus-bisporus.png'),
    'Agaricus campestris': require('../assets/mushroom-photos/Agaricus-campestris.png'),
    'Agaricus silvaticus': require('../assets/mushroom-photos/Agaricus-silvaticus.png'),
    'Agaricus xanthodermus': require('../assets/mushroom-photos/Agaricus-xanthodermus.png'),
    'Amanita caesarea': require('../assets/mushroom-photos/Amanita-caesarea.png'),
    'Amanita citrina': require('../assets/mushroom-photos/Amanita-citrina.png'),
    'Amanita crocea': require('../assets/mushroom-photos/Amanita-crocea.png'),
    'Amanita excelsa': require('../assets/mushroom-photos/Amanita-excelsa.png'),
    'Amanita fulva': require('../assets/mushroom-photos/Amanita-fulva.png'),
    'Amanita gemmata': require('../assets/mushroom-photos/Amanita-gemmata.png'),
    'Amanita jacksonii': require('../assets/mushroom-photos/Amanita-jacksonii.png'),
    'Amanita muscaria': require('../assets/mushroom-photos/Amanita-muscaria.png'),
    'Amanita muscaria var. guessowii': require('../assets/mushroom-photos/Amanita-muscaria-var-guessowii.png'),
    'Amanita nivalis': require('../assets/mushroom-photos/Amanita-nivalis.png'),
    'Amanita pantherina': require('../assets/mushroom-photos/Amanita-pantherina.png'),
    'Amanita phalloides': require('../assets/mushroom-photos/Amanita-phalloides.png'),
    'Amanita porphyria': require('../assets/mushroom-photos/Amanita-porphyria.png'),
    'Amanita regalis': require('../assets/mushroom-photos/Amanita-regalis.png'),
    'Amanita rubescens': require('../assets/mushroom-photos/Amanita-rubescens.png'),
    'Amanita submembranacea': require('../assets/mushroom-photos/Amanita-submembranacea.png'),
    'Amanita vaginata': require('../assets/mushroom-photos/Amanita-vaginata.png'),
    'Amanita virosa': require('../assets/mushroom-photos/Amanita-virosa.png'),
    'Boletus aereus': require('../assets/mushroom-photos/Boletus-aereus.png'),
    'Boletus appendiculatus': require('../assets/mushroom-photos/Boletus-appendiculatus.png'),
    'Boletus badius': require('../assets/mushroom-photos/Boletus-badius.png'),
    'Boletus calopus': require('../assets/mushroom-photos/Boletus-calopus.png'),
    'Boletus edulis': require('../assets/mushroom-photos/Boletus-edulis.png'),
    'Boletus erythropus': require('../assets/mushroom-photos/Boletus-erythropus.png'),
    'Boletus luridus': require('../assets/mushroom-photos/Boletus-luridus.png'),
    'Boletus pinophilus': require('../assets/mushroom-photos/Boletus-pinophilus.png'),
    'Boletus pulverulentus': require('../assets/mushroom-photos/Boletus-pulverulentus.png'),
    'Boletus queletii': require('../assets/mushroom-photos/Boletus-queletii.png'),
    'Boletus radicans': require('../assets/mushroom-photos/Boletus-radicans.png'),
    'Boletus regius': require('../assets/mushroom-photos/Boletus-regius.png'),
    'Boletus reticulatus': require('../assets/mushroom-photos/Boletus-reticulatus.png'),
    'Boletus satanas': require('../assets/mushroom-photos/Boletus-satanas.png'),
    'Boletus subtomentosus': require('../assets/mushroom-photos/Boletus-subtomentosus.png'),
    'Cantharellus cibarius': require('../assets/mushroom-photos/Cantharellus-cibarius.png'),
    'Cantharellus tubaeformis': require('../assets/mushroom-photos/Cantharellus-tubaeformis.png'),
    'Clathrus archeri': require('../assets/mushroom-photos/Clathrus-archeri.png'),
    'Clitocybe clavipes': require('../assets/mushroom-photos/Clitocybe-clavipes.png'),
    'Clitocybe dealbata': require('../assets/mushroom-photos/Clitocybe-dealbata.png'),
    'Clitocybe fragrans': require('../assets/mushroom-photos/Clitocybe-fragrans.png'),
    'Clitocybe geotropa': require('../assets/mushroom-photos/Clitocybe-geotropa.png'),
    'Clitocybe gibba': require('../assets/mushroom-photos/Clitocybe-gibba.png'),
    'Clitocybe nebularis': require('../assets/mushroom-photos/Clitocybe-nebularis.png'),
    'Clitocybe odora': require('../assets/mushroom-photos/Clitocybe-odora.png'),
    'Clitocybe rivulosa': require('../assets/mushroom-photos/Clitocybe-rivulosa.png'),
    'Cortinarius caperatus': require('../assets/mushroom-photos/Cortinarius-caperatus.png'),
    'Cortinarius praestans': require('../assets/mushroom-photos/Cortinarius-praestans.png'),
    'Cortinarius semisanguineus': require('../assets/mushroom-photos/Cortinarius-semisanguineus.png'),
    'Cortinarius violaceus': require('../assets/mushroom-photos/Cortinarius-violaceus.png'),
    'Craterellus cornucopioides': require('../assets/mushroom-photos/Craterellus-cornucopioides.png'),
    'Craterellus tubaeformis': require('../assets/mushroom-photos/Craterellus-tubaeformis.png'),
    'Gyromitra esculenta': require('../assets/mushroom-photos/Gyromitra-esculenta.png'),
    'Hydnellum peckii': require('../assets/mushroom-photos/Hydnellum-peckii.png'),
    'Hydnum repandum': require('../assets/mushroom-photos/Hydnum-repandum.png'),
    'Hygrophoropsis aurantiaca': require('../assets/mushroom-photos/Hygrophoropsis-aurantiaca.png'),
    'Hygrophorus camarophyllus': require('../assets/mushroom-photos/Hygrophorus-camarophyllus.png'),
    'Hygrophorus olivaceoalbus': require('../assets/mushroom-photos/Hygrophorus-olivaceoalbus.png'),
    'Hypholoma fasciculare': require('../assets/mushroom-photos/Hypholoma-fasciculare.png'),
    'Laccaria amethystina': require('../assets/mushroom-photos/Laccaria-amethystina.png'),
    'Laccaria bicolor': require('../assets/mushroom-photos/Laccaria-bicolor.png'),
    'Laccaria laccata': require('../assets/mushroom-photos/Laccaria-laccata.png'),
    'Laccaria proxima': require('../assets/mushroom-photos/Laccaria-proxima.png'),
    'Lactarius camphoratus': require('../assets/mushroom-photos/Lactarius-camphoratus.png'),
    'Lactarius deliciosus': require('../assets/mushroom-photos/Lactarius-deliciosus.png'),
    'Lactarius deterrimus': require('../assets/mushroom-photos/Lactarius-deterrimus.png'),
    'Lactarius helvus': require('../assets/mushroom-photos/Lactarius-helvus.png'),
    'Lactarius indigo': require('../assets/mushroom-photos/Lactarius-indigo.png'),
    'Lactarius pubescens': require('../assets/mushroom-photos/Lactarius-pubescens.png'),
    'Lactarius rufus': require('../assets/mushroom-photos/Lactarius-rufus.png'),
    'Lactarius torminosus': require('../assets/mushroom-photos/Lactarius-torminosus.png'),
    'Lactarius trivialis': require('../assets/mushroom-photos/Lactarius-trivialis.png'),
    'Lactarius turpis': require('../assets/mushroom-photos/Lactarius-turpis.png'),
    'Lactarius vellereus': require('../assets/mushroom-photos/Lactarius-vellereus.png'),
    'Leccinum scabrum': require('../assets/mushroom-photos/Leccinum-scabrum.png'),
    'Leccinum versipelle': require('../assets/mushroom-photos/Leccinum-versipelle.png'),
    'Russula aeruginea': require('../assets/mushroom-photos/Russula-aeruginea.png'),
    'Russula claroflava': require('../assets/mushroom-photos/Russula-claroflava.png'),
    'Russula cyanoxantha': require('../assets/mushroom-photos/Russula-cyanoxantha.png'),
    'Russula emetica': require('../assets/mushroom-photos/Russula-emetica.png'),
    'Russula integra': require('../assets/mushroom-photos/Russula-integra.png'),
    'Russula ochroleuca': require('../assets/mushroom-photos/Russula-ochroleuca.png'),
    'Russula paludosa': require('../assets/mushroom-photos/Russula-paludosa.png'),
    'Russula rosea': require('../assets/mushroom-photos/Russula-rosea.png'),
    'Russula vesca': require('../assets/mushroom-photos/Russula-vesca.png'),
    'Russula virescens': require('../assets/mushroom-photos/Russula-virescens.png'),
    'Russula xerampelina': require('../assets/mushroom-photos/Russula-xerampelina.png'),
    'Sarcodon imbricatus': require('../assets/mushroom-photos/Sarcodon-imbricatus.png'),
    'Suillus luteus': require('../assets/mushroom-photos/Suillus-luteus.png'),
    'Tricholoma equestre': require('../assets/mushroom-photos/Tricholoma-equestre.png'),
    'Tricholoma flavovirens': require('../assets/mushroom-photos/Tricholoma-flavovirens.png'),
    'Tricholoma matsutake': require('../assets/mushroom-photos/Tricholoma-matsutake.png'),
    'Tricholoma pessundatum': require('../assets/mushroom-photos/Tricholoma-pessundatum.png'),
    'Tricholoma portentosum': require('../assets/mushroom-photos/Tricholoma-portentosum.png'),
    'Tricholoma sulphureum': require('../assets/mushroom-photos/Tricholoma-sulphureum.png'),
    'Tricholoma terreum': require('../assets/mushroom-photos/Tricholoma-terreum.png'),
};
export default mushroomPictureMap;