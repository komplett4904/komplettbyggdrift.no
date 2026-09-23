# Drift av Komplett Byggdrift

## Tilgang
Internverktøy krever verifisert Google-innlogging og godkjenning i Supabase. Frontend er offentlig kildekode; databasens rettigheter håndhever datatilgangen. Gjestekoder åpner bare en separat demo med eksempeldata.

## Prosjektlagring
Bare endrede prosjekter sendes ved vanlig lagring. Nettleseren beholder en kø med mislykkede operasjoner per innlogget bruker. Køen prøves igjen når nettforbindelsen kommer tilbake, når data hentes, eller med «Prøv lagring igjen». Ikke tøm nettleserdata mens endringer venter. Status «Lagret i skyen» betyr at serveren har bekreftet operasjonene.

Dette er ikke konfliktfri samskriving: to personer bør ikke redigere samme prosjekt samtidig. Eksplisitt import av lokale prosjekter sender fortsatt hele den valgte lokale listen. Eldre lokale endringer fra før denne køen ble innført er ikke automatisk gjenkjent som ventende endringer.

## Arbeidsplan
«Planlegg arbeid» på et prosjekt overfører navn, adresse, arbeidsbeskrivelse og ansvarlig til kalenderen i samme fane. Overføringen ligger midlertidig i nettleserøkten, ikke i nettadressen, og brukes bare av samme innloggede bruker innen 30 minutter. Dato og klokkeslett velges i arbeidsplanen. Kalenderutkast lagres først når brukeren trykker Lagre i Google Kalender.

## Sikkerhetskopier – ikke etablert
Kontroll 23. september 2026: Supabase Free viser at abonnementet ikke inkluderer prosjektbackuper. Vanlig databasebackup inneholder heller ikke Storage-bildefilene, bare metadata. Kodehistorikken i GitHub og nettleserens lagringskø erstatter ikke backup.

Før en løsning regnes som ferdig må følgende være etablert:
1. Regelmessig eksport av databaseskjema, rettigheter og data til et separat privat lagringssted.
2. Separat kopi av objektene i befaring-bilder, prosjekt-bilder og avvik-bilder, med opprinnelige filstier.
3. Kontroll av alder, antall filer, størrelser og feil på hver backup.
4. Gjenoppretting i et separat testmiljø, inkludert innlogging, tilgangsregler og bildevisning. Ikke test ved å overskrive produksjon.

Ingen betalingsplan, nye lagringskontoer eller automatiske backuper er aktivert av denne endringen. Se https://supabase.com/docs/guides/platform/backups.
