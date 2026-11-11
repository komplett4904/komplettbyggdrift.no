(() => {
  'use strict';
  const page = document.getElementById('kb-inspection');
  if (!page || !window.KBAuth?.can('projects')) return;
  const db = window.KBDatabase.getClient();
  const rehabilitation = [
    { heading: "Før oppstart", points: [
      { id: 9, label: "Arbeidsomfang, vedlikehold eller søknadspliktig tiltak er avklart. Eventuelle plan- og vernebestemmelser samt nødvendige tillatelser er avklart.", reference: ["DiBK · Arbeid på tak","https://www.dibk.no/bygge-eller-endre/arbeid-pa-eksisterende-bygg/eksempler-pa-byggearbeid-pa-tak"] },
      { id: 10, label: "Risiko ved arbeid i høyden er vurdert, inkludert adkomst, gjennomtråkk og fall. Fallsikring er etablert og kontrollert før oppstart.", reference: ["Arbeidstilsynet · Arbeid på tak","https://www.arbeidstilsynet.no/risikofylt-arbeid/arbeid-i-hoyden/unnga-fall-ved-arbeid-pa-tak/"] },
      { id: 11, label: "Materialer som kan inneholde asbest er avklart før inngrep. Ved mistanke er arbeidet stanset inntil materialet er avklart.", reference: ["Arbeidstilsynet · Ved mistanke om asbest","https://www.arbeidstilsynet.no/risikofylt-arbeid/kjemikalier/asbest/hva-gjor-du-hvis-du-stoter-pa-asbest/"] },
      { id: 12, label: "Berørte bærende deler og konsekvenser av økt egenlast, snølast og vindlast er avklart og dokumentert i prosjekteringen.", reference: ["TEK17 § 10-2","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/10/10-2"] },
      { id: 0, label: "Arbeid kontrollert mot relevant monteringsanvisning og produktunderlag", reference: ["TEK17 § 2-4","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/2/2-4"] },
      { id: 13, label: "Produktene er egnet for valgt takoppbygging, takfall, underlag og eksponering. Relevant produktdokumentasjon er tilgjengelig.", reference: ["TEK17 § 3-1","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/3/3-1"] },
      { id: 14, label: "Avfallsplan, miljøkartlegging og eventuelt rapporteringskrav er avklart for tiltaket.", reference: ["TEK17 kapittel 9","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/9"] }
    ] },
    { heading: "Underlag, fukt og lufting", points: [
      { id: 1, label: "Eksisterende rupanel/underlag kontrollert, nødvendige skader utbedret" },
      { id: 15, label: "Underlag og materialer er tilstrekkelig tørre før lukking. Fukt er kontrollert og måleresultater dokumentert der nødvendig.", reference: ["TEK17 § 13-14","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-14"] },
      { id: 2, label: "Undertak, skjøter, oppbrett og avslutninger kontrollert", reference: ["TEK17 § 13-12","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-12"] },
      { id: 3, label: "Sløyfer, lekter, lufting og innfesting kontrollert" },
      { id: 16, label: "Ved endring av isolasjon eller takoppbygging er lufttetting, dampsperre og ventilasjon kontrollert mot prosjektert løsning.", reference: ["TEK17 § 13-13","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-13"] },
      { id: 17, label: "Berørte energikrav og utført isolasjon er kontrollert mot prosjektert løsning.", reference: ["TEK17 kapittel 14","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/14"] },
      { id: 18, label: "Midlertidig tildekking, renhold og bortledning av vann er kontrollert i byggeperioden." }
    ] },
    { heading: "Tekking og detaljer", points: [
      { id: 4, label: "Takstein og innfesting/stormklips kontrollert" },
      { id: 5, label: "Møne, takfot og fuglesperre kontrollert" },
      { id: 6, label: "Beslag, overganger, renner og gjennomføringer kontrollert", reference: ["TEK17 § 13-12","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-12"] },
      { id: 8, label: "Vindskier og pannebord kontrollert der dette inngår" },
      { id: 19, label: "Takplater eller shingel er kontrollert mot monteringsanvisning, inkludert overlapp, avslutninger og innfestingsmønster." },
      { id: 20, label: "Takfolie eller takbelegg er kontrollert mot systemanvisning, inkludert skjøter, sveiser, hjørner, oppkanter og avslutninger." },
      { id: 21, label: "Takvinduer, piper, luftehatter og øvrige gjennomføringer er kontrollert for tetting og avrenning." },
      { id: 22, label: "Takterrasse, grønt tak, solanlegg eller annet utstyr er kontrollert ved berørte innfestinger, overganger og gjennomføringer." },
      { id: 23, label: "Tekking og takdeler er sikret mot nedfall og vindpåvirkning i tråd med prosjektert innfesting.", reference: ["TEK17 § 10-3","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/10/10-3"] }
    ] },
    { heading: "Avrenning og sikkerhet", points: [
      { id: 24, label: "Fall og avrenning er kontrollert. Regn- og smeltevann ledes bort uten å skade konstruksjon eller terreng.", reference: ["TEK17 § 13-12","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-12"] },
      { id: 25, label: "På flate eller svakt skrånende tak er sluk, nedløp og avrenningsvei ved blokkering kontrollert, inkludert nødoverløp der det inngår.", reference: ["TEK17 § 13-12","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-12"] },
      { id: 26, label: "Renner, nedløp, innfestinger og utkast er kontrollert. Avrenningen er funksjonsprøvd der praktisk." },
      { id: 7, label: "Taksikring/snøfangere/takstige kontrollert der dette inngår" },
      { id: 27, label: "Løsning for å hindre at snø og is faller ned på steder der personer eller husdyr oppholder seg er kontrollert.", reference: ["TEK17 § 10-3","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/10/10-3"] },
      { id: 28, label: "Der skorstein berøres, er muligheten for feiing og uttak av sot ivaretatt. Eventuell takstige eller feieplattform er kontrollert.", reference: ["TEK17 § 15-3","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/15/i/15-3"] },
      { id: 29, label: "Taktekkingens brannegenskaper og eventuelle berørte brannskiller ved takfot, loft eller gjennomføringer er kontrollert mot brannunderlaget.", reference: ["TEK17 §§ 11-8 og 11-9","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/11"] }
    ] },
    { heading: "Sluttkontroll og dokumentasjon", points: [
      { id: 30, label: "Utførelsen er dokumentert mot produksjonsunderlaget. Registrerte avvik, tiltak og eventuell gjenstående oppfølging er dokumentert.", reference: ["TEK17 § 2-4","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/2/2-4"] },
      { id: 31, label: "FDV, inkludert relevante opplysninger om taksystem, tilsyn og vedlikehold, er samlet og overlevert til eier der det kreves.", reference: ["TEK17 §§ 4-1 og 4-2","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/4"] },
      { id: 32, label: "Avfall er sortert og levert i henhold til gjeldende krav. Kvitteringer og sluttrapport er dokumentert der det kreves.", reference: ["TEK17 §§ 9-8 og 9-9","https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/9/9-9"] },
      { id: 33, label: "Før-, underveis- og etterbilder er lagt ved, særlig av detaljer som er bygget inn." },
      { id: 34, label: "Oversikt over takflater, produkter, garanti og anbefalt intervall for ettersyn er lagt ved der det er avtalt." }
    ] }
  ];
  const templates = {
    'tak-rehabilitering': { title: 'Egenkontroll – takrehabilitering', sections: rehabilitation },
    'tak-for-vinter': { title: 'Høstsjekk av tak', points: [
      'Taksluk, rister og løvfang er kontrollert og renset ved behov',
      'Synlige taknedløp og utløp er kontrollert for blokkering og skader',
      'Nødoverløp er frie og synlig avrenning er kontrollert',
      'Lavpunkter og områder med stående vann er kontrollert',
      'Takbelegg, skjøter og oppkanter er kontrollert for synlige skader',
      'Beslag og gjennomføringer er kontrollert for synlige skader',
      'Løse gjenstander, vegetasjon og rusk er fjernet ved behov',
      'Synlige varmekabler ved sluk og nedløp er kontrollert der de finnes'
    ] },
    'tak-etter-vinter': { title: 'Vårsjekk av tak', points: [
      'Taksluk, løvfang, taknedløp og nødoverløp er kontrollert for blokkering og frostskader',
      'Avrenning og områder med stående smeltevann er kontrollert',
      'Takbelegg, skjøter og oppkanter er kontrollert for synlige vinter- og frostskader',
      'Beslag, gjennomføringer og innfestinger er kontrollert for synlige skader',
      'Synlige tegn på lekkasje eller fukt er registrert',
      'Renner og utløp er kontrollert for deformasjon eller løse deler',
      'Rusk og løse gjenstander er fjernet ved behov'
    ] }
  };
  Object.assign(templates, {
    lettvegg: { title: 'Lettvegg', sections: [
      { heading: 'Før oppstart', points: [
        { id: 0, label: 'Avklar at veggen er ikke-bærende, og vurder brann, lyd, dagslys, ventilasjon og eventuell søknadsplikt.' },
        { id: 1, label: 'Kontroller plassering og avklar skjulte rør og kabler før innfesting.' }
      ] },
      { heading: 'Før lukking', points: [
        { id: 2, label: 'Kontroller stenderverk, lodd og innfesting etter valgt veggsystem.' },
        { id: 3, label: 'Kontroller spikerslag, isolasjon og relevante tettinger. Ta bilder før veggen lukkes.' }
      ] },
      { heading: 'Sluttkontroll', points: [{ id: 4, label: 'Kontroller overflater, skjøter, åpninger og dørfunksjon. Dokumenter avvik.' }] }
    ] },
    vindusbytte: { title: 'Vindusbytte', sections: [
      { heading: 'Før montering', points: [
        { id: 0, label: 'Kontroller mål, vindustype og åpning. Avklar eventuell fasadeendring og rømningsfunksjon.' },
        { id: 1, label: 'Kontroller åpningen for fukt og skader. Avklar utbedring før montering.' }
      ] },
      { heading: 'Før listene monteres', points: [
        { id: 2, label: 'Kontroller understøtting, innfesting, vater og lodd etter monteringsanvisningen.' },
        { id: 3, label: 'Kontroller isolasjon, innvendig lufttetting, utvendig værbeskyttelse og vannavrenning. Ta bilder før tildekking.' }
      ] },
      { heading: 'Sluttkontroll', points: [{ id: 4, label: 'Test åpning, lukking og låsing. Kontroller beslag, finish og eventuell rømningsfunksjon.' }] }
    ] },
    parkett: { title: 'Parkett', sections: [
      { heading: 'Før legging', points: [
        { id: 0, label: 'Kontroller at undergulvet er rent, plant og tørt etter leverandørens krav. Noter målinger ved behov.' },
        { id: 1, label: 'Kontroller klima, eventuell akklimatisering, underlag og krav ved gulvvarme.' }
      ] },
      { heading: 'Legging og sluttkontroll', points: [
        { id: 2, label: 'Kontroller ekspansjonsfuger, skjøteforskyvning og overganger etter monteringsanvisningen.' },
        { id: 3, label: 'Kontroller at flytende gulv ikke klemmes fast av lister eller innredning.' },
        { id: 4, label: 'Sjekk skader, gliper, knirk og finish. Dokumenter avvik.' }
      ] }
    ] }
  });
  Object.assign(templates, {
    "kledning": {
      "title": "Kledning",
      "points": [
        "Kontroller underlaget for fukt og skader før det dekkes.",
        "Sjekk vindsperre, luftespalte, lekter og innfesting. Fotografer før tildekking.",
        "Sjekk panel, hjørner, beslag og vannbord for fri avrenning.",
        "Kontroller kappflater, overflatebehandling og avslutninger."
      ]
    },
    "dorbytte": {
      "title": "Bytte dør",
      "points": [
        "Kontroller mål, slagretning og dørtype. Avklar krav til brann, lyd, rømning eller terskel ved behov.",
        "Kontroller oppklossing, karmens lodd og vater og innfesting etter monteringsanvisningen.",
        "Kontroller tetting og terskel. På ytterdør: kontroller beslag og avrenning før tildekking.",
        "Test åpning, lukking, lås og jevne klaringer."
      ]
    },
    "service": {
      "title": "Service / småjobber",
      "points": [
        "Beskriv hva som skal repareres, og registrer tilstanden før arbeid.",
        "Kontroller tilpasning og innfesting av lister, terskler, beslag eller hengsler som inngår.",
        "Test funksjon og kontroller finish. Dokumenter avvik og eventuelt gjenstående arbeid."
      ]
    }
  });
  Object.assign(templates, {
    "ror-vann": {
      "title": "Vannrør og rør-i-rør",
      "sections": [
        {
          "heading": "Før lukking",
          "points": [
            {
              "id": 0,
              "label": "Kontroller rørføring, innfesting og skjøter mot systemets monteringsanvisning."
            },
            {
              "id": 1,
              "label": "Kontroller at skjulte vannrør har en løsning som synliggjør og håndterer lekkasjer. Ved rør-i-rør: sjekk skap, gjennomføringer og drenering.",
              "reference": [
                "DiBK · TEK17 § 15-5",
                "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/15/ii/15-5"
              ]
            },
            {
              "id": 2,
              "label": "Kontroller stoppekraner, merking og eventuell sikring mot tilbakestrømning.",
              "reference": [
                "DiBK · TEK17 § 15-5",
                "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/15/ii/15-5"
              ]
            }
          ]
        },
        {
          "heading": "Prøving og overlevering",
          "points": [
            {
              "id": 3,
              "label": "Utfør tetthetsprøving etter prosjektets og systemets anvisning. Noter prøvetrykk, varighet og resultat."
            },
            {
              "id": 4,
              "label": "Spyl og funksjonstest aktuelle tappesteder. Ta bilder før lukking og legg ved prøveresultat og FDV."
            }
          ]
        }
      ]
    },
    "ror-avlop": {
      "title": "Avløp og sluk",
      "sections": [
        {
          "heading": "Før lukking",
          "points": [
            {
              "id": 0,
              "label": "Kontroller dimensjon, fall, innfesting og skjøter etter prosjektering og monteringsanvisning.",
              "reference": [
                "DiBK · TEK17 § 15-6",
                "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/15/ii/15-6"
              ]
            },
            {
              "id": 1,
              "label": "Kontroller lufting og tilgang til rensepunkter og vannlåser der relevant.",
              "reference": [
                "DiBK · TEK17 § 15-6",
                "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/15/ii/15-6"
              ]
            },
            {
              "id": 2,
              "label": "Sjekk slukets plassering, innfesting og grensesnitt mot membranen sammen med ansvarlig fag.",
              "reference": [
                "DiBK · TEK17 § 13-15",
                "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-15"
              ]
            }
          ]
        },
        {
          "heading": "Sluttkontroll",
          "points": [
            {
              "id": 3,
              "label": "Kontroller tetthet og at vann renner unna. Dokumenter eventuelle avvik."
            },
            {
              "id": 4,
              "label": "Ta bilder av skjulte rør, sluk og tilkoblinger før tildekking."
            }
          ]
        }
      ]
    },
    "ror-vatrom": {
      "title": "Sanitær på bad og vaskerom",
      "sections": [
        {
          "heading": "Montering",
          "points": [
            {
              "id": 0,
              "label": "Kontroller innfesting og tilkoblinger for toalett, servant, dusj og øvrig utstyr."
            },
            {
              "id": 1,
              "label": "Kontroller gjennomføringer og avklar ansvar for tetting mot membran.",
              "reference": [
                "DiBK · TEK17 § 13-15",
                "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-15"
              ]
            },
            {
              "id": 2,
              "label": "For innebygd sisterne: kontroller at lekkasjevann blir synlig og håndtert som prosjektert.",
              "reference": [
                "DiBK · TEK17 § 13-15",
                "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-15"
              ]
            }
          ]
        },
        {
          "heading": "Funksjonsprøving",
          "points": [
            {
              "id": 3,
              "label": "Test spyling, vannlås, armatur, avløp og tetthet under bruk."
            },
            {
              "id": 4,
              "label": "Kontroller tilgang til avstenging og service. Dokumenter med bilder og FDV."
            }
          ]
        }
      ]
    },
    "ror-kjokken": {
      "title": "Kjøkken og lekkasjesikring",
      "sections": [
        {
          "heading": "Montering og prøving",
          "points": [
            {
              "id": 0,
              "label": "Kontroller tilkobling og innfesting av armatur, oppvaskmaskin og avløpsslange etter produsentens anvisning."
            },
            {
              "id": 1,
              "label": "Kontroller tilgjengelig avstenging og lekkasjesikring. Funksjonstest automatisk lekkasjestopper der den kreves eller er montert.",
              "reference": [
                "DiBK · TEK17 § 15-5",
                "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/15/ii/15-5"
              ]
            },
            {
              "id": 2,
              "label": "Kjør en funksjonstest og se etter lekkasje ved trykksatte koblinger og under tømming."
            },
            {
              "id": 3,
              "label": "Vis kunden avstenging og eventuell tilbakestilling av lekkasjestopper. Legg ved FDV."
            }
          ]
        }
      ]
    },
    "ror-bereder": {
      "title": "Varmtvannsbereder",
      "sections": [
        {
          "heading": "Montering og overlevering",
          "points": [
            {
              "id": 0,
              "label": "Kontroller plassering, understøtting og servicetilgang etter monteringsanvisningen."
            },
            {
              "id": 1,
              "label": "Kontroller sikkerhetsventil, håndtering av utløpsvann og lekkasjesikring etter anvisning og prosjektering.",
              "reference": [
                "DiBK · TEK17 § 15-5",
                "https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/15/ii/15-5"
              ]
            },
            {
              "id": 2,
              "label": "Fyll og luft berederen etter anvisningen før den settes i drift. Kontroller tetthet og funksjon."
            },
            {
              "id": 3,
              "label": "Avklar elektrisk tilkobling med registrert elvirksomhet der oppdraget krever det. Overlever FDV."
            }
          ]
        }
      ]
    }
  });
  const bucket = db.storage.from('kb-tak-vedlegg');
  const table = () => db.from('kb_tak_kontroller');
  let projects = [];
  let customPoints = [];
  const host = document.createElement('div');
  page.append(host);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = "<style>\n*{box-sizing:border-box}.card{background:var(--card,#fff);border:1px solid var(--border,#dce4e9);border-radius:13px;padding:22px;margin:15px 0;box-shadow:0 2px 9px #122b3b09}h1{font-size:27px;margin:8px 0}h2{font-size:18px;margin:0 0 15px}.muted{color:var(--muted,#526779);font-size:13px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}label{font-size:13px;font-weight:650;display:block}input,textarea,select{font:inherit;display:block;width:100%;border:1px solid #b8cbd5;border-radius:7px;padding:10px;margin-top:5px;background:var(--field,#fff);color:var(--text,#183244)}textarea{min-height:80px}button{background:#16747a;color:white;border:0;border-radius:8px;padding:11px 17px;font:inherit;font-weight:650;cursor:pointer}button.alt{background:#e4eef1;color:#143644}button:disabled{opacity:.5;cursor:wait}.actions{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}.line{display:grid;grid-template-columns:1fr 165px;gap:12px;align-items:center;border-bottom:1px solid #e7edf1;padding:10px 0}.point-comment{grid-column:1/-1}.line .point-comment[hidden]{display:none}.line label{font-size:14px;font-weight:500}.photos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.photo{border:1px solid #dae5ea;border-radius:9px;padding:8px;break-inside:avoid}.photo img{width:100%;height:145px;object-fit:contain}.photo p{font-size:12px;overflow-wrap:anywhere}.hidden{display:none!important}#notice{font-weight:650}.error{color:#b02c31}.ok{color:#147050}@media(max-width:650px){.grid{grid-template-columns:1fr}.line{grid-template-columns:1fr 135px}.photos{grid-template-columns:1fr 1fr}.card{padding:15px}}\n    article{padding:16px} .line{grid-template-columns:minmax(0,1fr) minmax(105px,26%)} [hidden]{display:none!important}\n    .requirement{display:block;margin-top:4px;color:var(--requirement,#a5242e);font-size:12px;font-weight:700}.requirement a{color:inherit}.check-group{margin:18px 0 0;font-size:15px}\n    @media(max-width:600px){\n      article{padding:12px 12px max(16px,env(safe-area-inset-bottom))}\n      .actions>*{flex:1 1 auto} button,input,select{min-height:44px;font-size:16px}\n      .line{grid-template-columns:1fr;gap:4px} .line select{margin-top:0}\n    }\n  #notice:empty{display:none}#notice:not(:empty){position:sticky;bottom:0;padding:10px;background:var(--card,#fff);border:1px solid var(--border,#dce4e9);border-radius:8px}</style><article><section id=\"checklist-picker\"><h1>Sjekklister</h1><section class=\"card\"><h2>Ny taksjekk</h2><div class=\"actions\"><button id=\"autumn\" type=\"button\">Høstsjekk</button><button id=\"spring\" type=\"button\">Vårsjekk</button></div><h2>Egenkontroll</h2><button id=\"rehab\" type=\"button\" class=\"alt\">Takrehabilitering</button></section></section><section id=\"checklist-form\" hidden><button type=\"button\" id=\"back-to-picker\" class=\"alt\">← Sjekklister</button><h1 id=\"report-title\" tabindex=\"-1\"></h1><section class=\"card no-print\"><h2>Åpne en lagret kontroll</h2><select id=\"template\" hidden aria-label=\"Sjekklistetype\"></select><label>Lagrede kontroller<select id=\"projects\"><option value=\"\">Velg kontroll</option></select></label></section><section class=\"card\"><h2>Informasjon om oppdraget</h2><label>Tilknyttet prosjekt<select id=\"linked-project\"><option value=\"\">Frittstående sjekkliste</option></select></label><div class=\"grid\"><label>Prosjektnavn / nummer<input id=\"project_name\"></label><label>Kunde / tiltakshaver<input id=\"customer\"></label><label>Adresse<input id=\"address\"></label><label>Kontrollør<input id=\"inspector\"></label><label>Arbeid startet<input type=\"date\" id=\"start_date\"></label><label>Arbeid ferdigstilt<input type=\"date\" id=\"end_date\"></label></div><label>Beskrivelse av utført arbeid<textarea id=\"description\"></textarea></label></section><section class=\"card\"><h2>Kontrollpunkter</h2><p class=\"muted no-print\">Velg OK, Avvik eller Ikke aktuelt. Punkter merket Ikke aktuelt blir utelatt fra PDF.</p><p class=\"muted\" id=\"rehab-guide\" hidden><strong>Rød stjerne = krav når relevant.</strong> Avklar hvilke regler som gjelder for jobben. Ved rent vedlikehold gjelder TEK17 normalt ikke. Bruk «Ikke aktuelt» for punkter utenfor omfanget. Se <a href=\"https://www.dibk.no/bygge-eller-endre/arbeid-pa-eksisterende-bygg/nar-gjelder-byggteknisk-forskrift-tek17/\" target=\"_blank\" rel=\"noopener\">DiBK om når TEK17 gjelder</a> og monteringsanvisningen for taksystemet.</p><div id=\"checks\"></div><div class=\"actions\"><button class=\"alt\" type=\"button\" id=\"add-point\">+ Legg til eget punkt</button></div><form id=\"custom-point-form\" hidden><label>Beskriv kontrollpunktet<input id=\"custom-point-text\" required maxlength=\"180\"></label><div class=\"actions\"><button type=\"submit\">Legg til punkt</button><button type=\"button\" class=\"alt\" id=\"cancel-point\">Avbryt</button></div></form></section><section class=\"card\"><h2>Avvik og avgrensninger</h2><label>Beskriv eventuelle avvik og tiltak<textarea id=\"deviations\"></textarea></label></section><section class=\"card\"><h2>Vedlegg og FDV</h2><p class=\"muted no-print\">Kontrollen lagres når du laster opp. Bilder blir med i PDF. FDV-PDF-er lastes ned separat fra vedleggslisten og legges ved i Boligmappa.</p><label class=\"no-print\">Velg flere bilder fra bildebiblioteket, eller legg ved FDV. Maks 15 MB per fil.<input type=\"file\" id=\"uploads\" accept=\"image/jpeg,image/png,image/webp,application/pdf\" multiple></label><div class=\"actions no-print\"><button id=\"upload\">Last opp vedlegg</button></div><div id=\"attachments\" class=\"photos\"></div><label>FDV og øvrige dokumenter (merknad)<textarea id=\"fdv_notes\"></textarea></label></section><section class=\"card\"><h2>Bekreftelse</h2><p>Kontrollpunkter merket OK er kontrollert. Avvik er beskrevet ovenfor.</p><div class=\"grid\"><label>Kontrollert av<input id=\"signed_by\"></label><label>Kontrolldato<input type=\"date\" id=\"signed_date\"></label></div></section><div class=\"actions\"><button id=\"save\" type=\"button\" class=\"alt\">Lagre kontroll</button><button id=\"pdf-preview\" type=\"button\" class=\"alt\">Forhåndsvis PDF</button><button id=\"print\" type=\"button\">Last ned PDF</button></div></section><p id=\"notice\" role=\"status\"></p></article>";
  const $ = id => root.getElementById(id);
  const fields = ['project_name','customer','address','inspector','start_date','end_date','description','deviations','fdv_notes'];
  const builtInSections = template => template.sections ?? [{ points: template.points.map((label, id) => ({ id, label })) }];
  function sections() {
    const builtIn = builtInSections(templates[$('template').value]);
    return customPoints.length ? [...builtIn, { heading: 'Egne punkter', points: customPoints }] : builtIn;
  }
  const points = () => sections().flatMap(section => section.points);
  const isRoofCheck = () => ['tak-for-vinter', 'tak-etter-vinter'].includes($('template').value);
  const notice = (message, error = false) => {
    $('notice').textContent = message;
    $('notice').className = error ? 'error no-print' : 'ok no-print';
  };
  let current = null;
  let busy = false;
  let dirty = false;
  $('checklist-form').addEventListener('input', event => {
    if (event.target.id !== 'projects') dirty = true;
  });
  const canLeave = () => !dirty || confirm('Kontrollen har endringer som ikke er lagret. Vil du gå videre?');

  async function run(action) {
    if (busy || !window.KBAuth.can('projects')) return;
    busy = true;
    const controls = [...root.querySelectorAll('button, input, textarea, select')];
    controls.forEach(control => control.disabled = true);
    notice('');
    try { await action(); }
    catch (error) { notice(error.message, true); }
    finally {
      root.querySelectorAll('button, input, textarea, select').forEach(control => control.disabled = false);
      busy = false;
    }
  }

  for (const [key, template] of Object.entries(templates)) {
    $('template').add(new Option(template.title, key));
  }

  function chooseProject(id) {
    $('linked-project').value = id || '';
    const project = projects.find(item => item.id === id);
    if (!project) return;
    if (!$('customer').value) $('customer').value = project.kunde ?? '';
    if (!$('address').value) $('address').value = project.address ?? '';
    if (!$('project_name').value) $('project_name').value = project.navn ?? '';
  }

  async function loadProjects() {
    const selected = $('linked-project').value;
    const { data, error } = await db.from('prosjekter').select('id,navn,kunde,address:state->tilbud->>sted')
      .order('sist_endret', { ascending: false });
    if (error) throw error;
    projects = data;
    $('linked-project').replaceChildren(new Option('Frittstående sjekkliste', ''));
    for (const project of projects) {
      $('linked-project').add(new Option([project.navn, project.kunde].filter(Boolean).join(' – ') || project.id, project.id));
    }
    $('linked-project').value = selected;
  }

  function fill(record = {}, projectId = null) {
    dirty = false;
    $('report-title').textContent = templates[$('template').value].title;
    for (const id of ['project_name', 'start_date', 'end_date']) $(id).closest('label').hidden = isRoofCheck();
    for (const id of fields) $(id).value = record[id] ?? (id === 'inspector' ? window.KBAuth.employee?.name ?? '' : '');
    $('signed_by').value = record.checks?.signed_by ?? '';
    $('signed_date').value = record.checks?.signed_date ?? (isRoofCheck() ? new Date().toLocaleDateString('sv-SE') : '');
    $('rehab-guide').hidden = $('template').value !== 'tak-rehabilitering';
    customPoints = (Array.isArray(record.checks?.custom_points) ? record.checks.custom_points : [])
      .filter(point => typeof point?.id === 'string' && /^extra-[a-f0-9-]{36}$/.test(point.id) && typeof point.label === 'string')
      .map(({ id, label }) => ({ id, label, custom: true }));
    $('custom-point-form').reset();
    $('custom-point-form').hidden = true;
    renderChecks(record.checks);
    chooseProject(record.portal_project_id ?? projectId);
    $('uploads').value = '';
    $('attachments').replaceChildren();
  }

  function renderChecks(answers = {}) {
    const checks = $('checks');
    checks.replaceChildren();
    for (const { heading, points } of sections()) {
      if (heading) {
        const title = document.createElement('h3');
        title.className = 'check-group';
        title.textContent = heading;
        checks.append(title);
      }
      for (const { id, label: point, reference, ...details } of points) {
        const row = document.createElement('div');
        row.className = 'line';
        const description = document.createElement('div');
        const label = document.createElement('label');
        label.htmlFor = 'c' + id;
        label.textContent = point;
        description.append(label);
        if (details.custom) {
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.className = 'alt';
          remove.textContent = 'Fjern';
          remove.setAttribute('aria-label', 'Fjern eget punkt: ' + point);
          remove.onclick = () => {
            const answers = checkAnswers();
            customPoints = customPoints.filter(item => item.id !== id);
            renderChecks(answers);
            dirty = true;
            $('add-point').focus();
          };
          description.append(remove);
        }
        if (reference) {
          const badge = document.createElement('span');
          badge.className = 'requirement';
          badge.textContent = '★ Krav når relevant · ';
          badge.id = 'requirement-' + id;
          const link = document.createElement('a');
          link.textContent = reference[0];
          link.href = reference[1];
          link.target = '_blank';
          link.rel = 'noopener';
          badge.append(link);
          description.append(badge);
        }
        const select = document.createElement('select');
        select.id = label.htmlFor;
        if (reference) select.setAttribute('aria-describedby', 'requirement-' + id);
        for (const [text, value] of [['Ikke vurdert',''],['OK','OK'],['Avvik','Avvik'],['Ikke aktuelt','NA']]) {
          select.add(new Option(text, value));
        }
        select.value = answers[id] ?? '';
        select.disabled = busy;
        row.append(description, select);
        const commentLabel = document.createElement('label');
        commentLabel.className = 'point-comment';
        commentLabel.textContent = 'Skriv kommentar';
        const comment = document.createElement('textarea');
        comment.id = 'comment-' + id;
        comment.setAttribute('aria-label', 'Skriv kommentar: ' + point);
        comment.value = answers.point_comments?.[id] ?? '';
        comment.disabled = busy;
        commentLabel.append(comment);
        const updateCommentVisibility = () => {
          commentLabel.hidden = select.value !== 'Avvik';
        };
        updateCommentVisibility();
        select.addEventListener('change', updateCommentVisibility);
        row.append(commentLabel);
        checks.append(row);
      }
    }
  }

  function checkAnswers() {
    const answers = {};
    const comments = {};
    for (const { id } of points()) {
      answers[id] = $('c' + id).value;
      const comment = $('comment-' + id).value;
      if (comment.trim()) comments[id] = comment;
    }
    if (Object.keys(comments).length) answers.point_comments = comments;
    return answers;
  }

  $('add-point').onclick = () => {
    $('custom-point-form').hidden = false;
    $('custom-point-text').focus();
  };
  $('cancel-point').onclick = () => {
    $('custom-point-form').reset();
    $('custom-point-form').hidden = true;
    $('add-point').focus();
  };
  $('custom-point-form').onsubmit = event => {
    event.preventDefault();
    const input = $('custom-point-text');
    const label = input.value.trim();
    if (!label) {
      input.focus();
      return;
    }
    const answers = checkAnswers();
    const id = 'extra-' + crypto.randomUUID();
    customPoints.push({ id, label, custom: true });
    dirty = true;
    renderChecks(answers);
    event.currentTarget.reset();
    event.currentTarget.hidden = true;
    $('c' + id).focus();
  };

  async function list() {
    const { data, error } = await table().select('id,project_name,address')
      .eq('checklist_type', $('template').value).order('updated_at', { ascending: false });
    if (error) throw error;
    $('projects').replaceChildren(new Option('Velg kontroll', ''));
    for (const row of data) $('projects').add(new Option([row.project_name,row.address].filter(Boolean).join(' – '), row.id));
    $('projects').value = current ?? '';
  }

  async function loadAttachments() {
    const objects = [];
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await bucket.list(current, { limit: 100, offset });
      if (error) throw error;
      objects.push(...data.filter(file => file.id));
      if (data.length < 100) break;
    }
    $('attachments').replaceChildren();
    if (!objects.length) return;
    const paths = objects.map(file => current + '/' + file.name);
    const { data, error } = await bucket.createSignedUrls(paths, 3600);
    if (error) throw error;
    for (const file of data) {
      if (!file.signedUrl) throw Error('Kunne ikke åpne alle vedlegg.');
      const name = file.path.split('/').pop().replace(/^[a-f0-9-]{36}-/, '');
      const box = document.createElement('div');
      box.className = 'photo';
      if (/\.(jpg|jpeg|png|webp)$/i.test(name)) {
        const img = document.createElement('img');
        img.src = file.signedUrl;
        img.alt = name;
        box.append(img);
      }
      const caption = document.createElement('p');
      caption.textContent = name;
      const link = document.createElement('a');
      link.href = file.signedUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Åpne vedlegg';
      link.className = 'no-print';
      box.append(caption, link);
      $('attachments').append(box);
    }
  }

  const entryProjectId = new URLSearchParams(location.search).get('prosjekt');
  function showPicker() {
    dirty = false;
    notice('');
    $('checklist-picker').hidden = false;
    $('checklist-form').hidden = true;
    window.scrollTo(0, 0);
    $('autumn').focus({ preventScroll: true });
  }

  $('back-to-picker').onclick = () => { if (canLeave()) showPicker(); };
  window.addEventListener('beforeunload', event => {
    if (dirty) event.preventDefault();
  });

  async function start(type) {
    current = null;
    $('template').value = type;
    $('projects').replaceChildren(new Option('Velg kontroll', ''));
    fill();
    $('checklist-picker').hidden = true;
    $('checklist-form').hidden = false;
    window.scrollTo(0, 0);
    $('report-title').focus({ preventScroll: true });
    await Promise.all([loadProjects().then(() => chooseProject(entryProjectId)), list()]);
  }
  $('linked-project').onchange = () => chooseProject($('linked-project').value);
  const picker = $('checklist-picker').querySelector('.card');
  picker.replaceChildren();
  const preview = document.createElement('dialog');
  preview.setAttribute('aria-labelledby', 'preview-title');
  preview.style.cssText = 'width:min(640px,calc(100% - 24px));max-height:85dvh;border:1px solid #b8cbd5;border-radius:12px;padding:18px;background:var(--card,#fff);color:var(--text,#183244)';
  const closePreview = document.createElement('button');
  closePreview.type = 'button';
  closePreview.textContent = 'Lukk';
  closePreview.onclick = () => preview.close();
  const previewTitle = document.createElement('h2');
  previewTitle.id = 'preview-title';
  const previewBody = document.createElement('div');
  preview.append(previewTitle, previewBody, closePreview);
  $('checklist-picker').append(preview);
  const showPreview = (template, trigger) => {
    previewTitle.textContent = template.title;
    const intro = document.createElement('p');
    intro.textContent = 'Dette dekker sjekklisten. Ingen kontroll blir opprettet. I skjemaet kan du velge OK, Avvik eller Ikke aktuelt, legge til egne punkter og laste opp bilder.';
    previewBody.replaceChildren(intro);
    for (const { heading, points } of builtInSections(template)) {
      if (heading) {
        const title = document.createElement('h3');
        title.textContent = heading;
        previewBody.append(title);
      }
      const list = document.createElement('ul');
      for (const point of points) {
        const item = document.createElement('li');
        item.textContent = point.label + (point.reference ? ' ★ Krav når relevant' : '');
        list.append(item);
      }
      previewBody.append(list);
    }
    preview.addEventListener('close', () => trigger.focus(), { once: true });
    preview.showModal();
    preview.scrollTop = 0;
  };
  for (const [heading, types] of [
    ['Ny taksjekk', ['tak-for-vinter', 'tak-etter-vinter']],
    ['Egenkontroll', Object.keys(templates).filter(type => !['tak-for-vinter', 'tak-etter-vinter'].includes(type) && !type.startsWith('ror-'))],
    ['Rørlegger', Object.keys(templates).filter(type => type.startsWith('ror-'))]
  ]) {
    const title = document.createElement('h2');
    title.textContent = heading;
    picker.append(title);
    for (const type of types) {
      const template = templates[type];
      const row = document.createElement('div');
      row.className = 'actions';
      const open = document.createElement('button');
      open.type = 'button';
      if (type === 'tak-for-vinter') open.id = 'autumn';
      open.textContent = template.title;
      open.onclick = () => run(() => start(type));
      const view = document.createElement('button');
      view.type = 'button';
      view.className = 'alt';
      view.textContent = 'Sjekklisten dekker';
      view.setAttribute('aria-label', 'Sjekklisten dekker: ' + template.title);
      view.onclick = () => showPreview(template, view);
      row.append(open, view);
      picker.append(row);
    }
  }
  $('projects').onchange = () => run(async () => {
    const id = $('projects').value;
    if (!canLeave()) {
      $('projects').value = current ?? '';
      return;
    }
    if (!id) {
      current = null;
      fill();
      return;
    }
    const { data, error } = await table().select('*').eq('id', id)
      .eq('checklist_type', $('template').value).single();
    if (error) {
      $('projects').value = current ?? '';
      throw error;
    }
    current = data.id;
    fill(data);
    await loadAttachments();
  });
  async function save() {
    const record = Object.fromEntries(fields.map(id => {
      const value = $(id).value.trim();
      return [id, id.endsWith('_date') ? value || null : value];
    }));
    if (isRoofCheck()) {
      if (!record.customer || !record.address) throw Error('Fyll ut kunde og adresse.');
      record.project_name = [record.customer, $('signed_date').value].filter(Boolean).join(' – ');
    }
    if (!record.project_name) throw Error('Fyll ut prosjektnavn eller prosjektnummer.');
    record.checks = checkAnswers();
    if (customPoints.length) record.checks.custom_points = customPoints;
    record.checks.signed_by = $('signed_by').value;
    record.checks.signed_date = $('signed_date').value;
    record.checklist_type = $('template').value;
    record.portal_project_id = $('linked-project').value || null;
    record.updated_at = new Date().toISOString();
    const query = current ? table().update(record).eq('id', current).eq('checklist_type', record.checklist_type) : table().insert(record);
    const { data, error } = await query.select('id').single();
    if (error) throw error;
    current = data.id;
    dirty = false;
    await list();
  }
  $('save').onclick = () => run(async () => {
    await save();
    notice('Kontroll lagret.');
  });
  $('upload').onclick = () => run(async () => {
    const files = [...$('uploads').files];
    if (!files.length) throw Error('Velg minst én fil.');
    notice('Laster opp ' + files.length + ' vedlegg …');
    for (const file of files) {
      if (file.size > 15728640 || !['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)) {
        throw Error('Ugyldig fil: ' + file.name);
      }
    }
    await save();
    const pending = new DataTransfer();
    for (const file of files) pending.items.add(file);
    while (pending.files.length) {
      const f = pending.files[0];
      let uploadFile = f;
      if (f.type.startsWith('image/')) {
        const bitmap=await createImageBitmap(f,{imageOrientation:'from-image'});
        const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(bitmap.width*scale));
        canvas.height=Math.max(1,Math.round(bitmap.height*scale));
        const ctx=canvas.getContext('2d');
        ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
        bitmap.close();
        const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.78));
        if(!blob)throw Error('Kunne ikke komprimere bildet');
        uploadFile=new File([blob],f.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'});
      }
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const { error } = await bucket.upload(current + '/' + crypto.randomUUID() + '-' + safeName, uploadFile, { contentType: uploadFile.type });
      if (error) throw Error(f.name + ': ' + error.message);
      pending.items.remove(0);
      $('uploads').files = pending.files;
    }
    await loadAttachments();
    notice('Vedlegg lastet opp.');
  });
  async function buildPdf() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
    const margin = 15;
    const width = 180;
    const title = $('report-title').textContent;
    let y = 16;
    pdf.setProperties({ title, author: 'Komplett Byggdrift AS' });

    function room(height) {
      if (y + height > 280) {
        pdf.addPage();
        y = 16;
      }
    }

    function text(value, size = 11, bold = false) {
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setFontSize(size);
      const height = size * 0.43;
      for (const line of pdf.splitTextToSize(value, width)) {
        room(height);
        pdf.text(line, margin, y);
        y += height;
      }
    }

    function heading(value) {
      room(15);
      y += 5;
      pdf.setDrawColor(196, 211, 220);
      pdf.line(margin, y - 5, margin + width, y - 5);
      pdf.setTextColor(22, 74, 82);
      text(value, 13, true);
      pdf.setTextColor(24, 50, 68);
      y += 2;
    }

    function field(label, id) {
      const value = $(id).value.trim();
      if (value) text(label + ': ' + value);
    }

    pdf.setFillColor(22, 46, 67);
    pdf.rect(0, 0, 210, 40, 'F');
    pdf.setFillColor(242, 186, 75);
    pdf.rect(0, 40, 210, 1.5, 'F');
    pdf.setTextColor(255);
    y = 12;
    text('KOMPLETT BYGGDRIFT AS  /  KONTROLLRAPPORT', 10, true);
    y = 25;
    text(title, 21, true);
    pdf.setTextColor(24, 50, 68);
    y = 52;
    heading('Oppdragsinformasjon');
    if (!isRoofCheck()) field('Prosjekt', 'project_name');
    field('Kunde', 'customer');
    field('Adresse', 'address');
    field('Kontrollør', 'inspector');
    field('Kontrolldato', 'signed_date');
    if (!isRoofCheck()) {
      field('Arbeid startet', 'start_date');
      field('Arbeid ferdigstilt', 'end_date');
    }
    field('Beskrivelse', 'description');
    heading('Kontrollpunkter');
    for (const section of sections()) {
      const applicable = section.points.filter(({ id }) => $('c' + id).value !== 'NA');
      if (!applicable.length) continue;
      if (section.heading) heading(section.heading);
      for (const { id, label, reference } of applicable) {
        const status = $('c' + id).value || 'Ikke vurdert';
        const color = status === 'OK' ? [25, 105, 77] : status === 'Avvik' ? [163, 43, 48] : [76, 96, 112];
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(label, 138);
        const rowHeight = Math.max(11, lines.length * 4.3 + 5 + (reference ? 4 : 0));
        room(rowHeight);
        pdf.setFillColor(243, 247, 249);
        pdf.roundedRect(margin, y - 4, width, rowHeight - 1.5, 1.5, 1.5, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(...color);
        pdf.text(status, margin + 3, y + 1);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(24, 50, 68);
        lines.forEach((line, index) => pdf.text(line, margin + 38, y + 1 + index * 4.3));
        if (reference) {
          pdf.setFontSize(8);
          pdf.setTextColor(157, 36, 46);
          pdf.text('Krav når relevant · ' + reference[0], margin + 38, y + 1 + lines.length * 4.3);
          pdf.setTextColor(24, 50, 68);
        }
        y += rowHeight;
        const comment = $('comment-' + id).value.trim();
        if (status === 'Avvik' && comment) {
          text('Kommentar: ' + comment, 10);
          y += 2;
        }
      }
    }
    if ($('deviations').value.trim()) {
      heading('Avvik og tiltak');
      text($('deviations').value);
    }
    field('Kontrollert av', 'signed_by');
    field('FDV og øvrige dokumenter', 'fdv_notes');

    const images = [...$('attachments').querySelectorAll('img')];
    if (images.length) heading('Bilder');
    for (let index = 0; index < images.length; index += 2) {
      room(63);
      for (const [column, image] of images.slice(index, index + 2).entries()) {
        const response = await fetch(image.src);
        if (!response.ok) throw Error('Kunne ikke hente bildet ' + image.alt);
        const bitmap = await createImageBitmap(await response.blob());
        const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext('2d');
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const ratio = Math.min(86 / canvas.width, 57 / canvas.height);
        const imageWidth = canvas.width * ratio;
        const imageHeight = canvas.height * ratio;
        const x = margin + column * 92 + (86 - imageWidth) / 2;
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.82), 'JPEG', x, y, imageWidth, imageHeight);
      }
      y += 63;
    }

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      pdf.setPage(page);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setDrawColor(196, 211, 220);
      pdf.line(margin, 283, 195, 283);
      pdf.setTextColor(76, 96, 112);
      pdf.text('Komplett Byggdrift AS', margin, 288);
      pdf.text(page + ' / ' + pageCount, 195, 288, { align: 'right' });
    }
    const locationName = ($('address').value || $('project_name').value)
      .trim().slice(0, 70).replace(/[^a-zA-Z0-9æøåÆØÅ_-]+/g, '-');
    return { pdf, filename: title.replaceAll(' ', '-') + '-' + locationName + '.pdf' };
  }

  const pdfDialog = document.createElement('dialog');
  pdfDialog.setAttribute('aria-label', 'Forhåndsvis PDF');
  pdfDialog.style.cssText = 'box-sizing:border-box;width:min(1000px,calc(100% - 16px));max-width:none;border:1px solid var(--border,#dce4e9);border-radius:12px;padding:12px;background:var(--card,#fff);color:var(--text,#183244)';
  const pdfTools = document.createElement('div');
  pdfTools.className = 'actions';
  const pdfClose = document.createElement('button');
  pdfClose.type = 'button';
  pdfClose.textContent = 'Lukk';
  pdfClose.onclick = () => pdfDialog.close();
  const pdfLink = document.createElement('a');
  pdfLink.textContent = 'Åpne PDF i ny fane';
  pdfLink.target = '_blank';
  pdfLink.rel = 'noopener';
  pdfLink.style.cssText = 'align-self:center;color:inherit';
  const pdfFrame = document.createElement('iframe');
  pdfFrame.title = 'Rapport i PDF-format';
  pdfFrame.style.cssText = 'width:100%;height:70dvh;border:0;background:#fff';
  pdfTools.append(pdfClose, pdfLink);
  pdfDialog.append(pdfTools, pdfFrame);
  $('checklist-form').after(pdfDialog);
  let pdfUrl;
  pdfDialog.addEventListener('close', () => {
    pdfFrame.removeAttribute('src');
    pdfLink.removeAttribute('href');
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    pdfUrl = undefined;
    $('pdf-preview').focus();
  });
  $('pdf-preview').onclick = () => run(async () => {
    const { pdf } = await buildPdf();
    pdfUrl = URL.createObjectURL(pdf.output('blob'));
    pdfLink.href = pdfUrl;
    pdfFrame.src = pdfUrl + '#navpanes=0&view=FitH';
    pdfDialog.showModal();
  });

  $('print').onclick = () => run(async () => {
    if (points().some(({ id }) => !$('c' + id).value) &&
        !confirm('Noen kontrollpunkter er ikke vurdert. Vil du likevel laste ned rapporten?')) return;
    await save();
    await loadAttachments();
    const { pdf, filename } = await buildPdf();
    pdf.save(filename);
    notice('PDF klar til å legges ved i e-post.');
  });
  fill();
  page.hidden = false;
})();
