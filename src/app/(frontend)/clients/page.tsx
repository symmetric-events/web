import React from "react";
import { ClientLogo } from "../components/clientLogo";
import { TestimonialCard } from "../components/TestimonialCard";
import { PageHeader } from "../components/PageHeader";
import { ClientLogosCarousel } from "../components/ClientLogosCarousel";

export default function OurClientsPage() {
  const clients = {
    A: [
      "Abbott",
      "Abbvie",
      "Abiogen Pharma",
      "Acino International",
      "Adalvo",
      "Adamed",
      "ADC Therapeutics",
      "adienne",
      "Adocia",
      "Advanz Pharma",
      "Advent Bioservices",
      "Adverum Biotechnologies",
      "Aeglea BioTherapeutics",
      "Aenova Gruop",
      "Affibody Medical",
      "Affimed",
      "AGC Biologics",
      "Agios Pharmaceuticals",
      "Air Liquide",
      "AIXIAL",
      "AJVaccines",
      "Akcea Therapeutics",
      "Akebia Therapeutics",
      "Alfasigma",
      "Algalif",
      "Alira Health",
      "Alkaloid",
      "Alkermes",
      "Allergan",
      "Alligator Bioscience",
      "Almirall",
      "Alnylam Pharmaceuticals",
      "Altran",
      "Ambrx",
      "Amgen",
      "Amicus Therapeutics",
      "Amniotics",
      "Amryt Pharma",
      "Anabiotec",
      "Anaconda BioMed",
      "AnaptysBio",
      "Angelini",
      "Antibiotice",
      "AOP Orphan Pharmaceuticals",
      "Apellis Pharmaceuticals",
      "Approcess",
      "Aptus Clinical",
      "Aqvida",
      "Ardena",
      "Arecor",
      "Arterium",
      "Asahi Kasei",
      "Ascendis Pharma",
      "Ashland",
      "Asphalion",
      "Astellas Pharma",
      "AstraZeneca",
      "Atnahs Pharma",
      "Aurobindo Pharma",
      "Autifony Therapeutics",
      "Autolus Therapeutics",
      "Avectas",
      "AveXis",
    ],
    B: [
      "B. Braun",
      "Basic Pharma",
      "Basilea Pharmaceutica",
      "Batavia Biosciences",
      "Bavarian Nordic",
      "Bayer",
      "BCN Peptide",
      "Beam Therapeutics",
      "Beiersdorf",
      "Belupo",
      "Bharat Serums and Vaccines",
      "BIAL",
      "Bio-Rad Laboratories",
      "Biocad",
      "BioConnection",
      "Biogen",
      "BioMarin",
      "Biomerieux",
      "Bionica Pharmaceuticals",
      "Bionorica",
      "BioPhorum Operations Group",
      "Biotalys",
      "Biotechpharma",
      "Biotest",
      "Biotestlab",
      "Biovian",
      "Blue Cross Laboratories",
      "bluebird bio",
      "Bluepharma",
      "BlueRock Therapeutics",
      "Boehringer Ingelheim",
      "Bristol Myers Squibb",
      "Britannia Pharmaceuticals",
      "Bruno Farmaceutici",
      "BSP Pharmaceuticals",
      "Byondis",
    ],
    C: [
      "CAI",
      "Cairdac",
      "Cam Bioceramics",
      "Camurus AB",
      "Carbogen-amcis",
      "Catalent",
      "Catapult",
      "Celcuity",
      "Celgene",
      "Cellectis",
      "Cellinta",
      "Celon Pharma",
      "Celonic",
      "Celyad",
      "Cenexi",
      "Centogene",
      "Centrient Pharmaceuticals",
      "Certara",
      "Chanelle Pharma",
      "Charité",
      "Charles River Laboratories",
      "Chemi Spa",
      "Chemo",
      "ChemoCentryx",
      "Chemopharma",
      "Chiesi",
      "Cipla",
      "Cisiv",
      "Clinigma",
      "Clinity",
      "Comser Pharma",
      "Congenius",
      "Consilient Health",
      "Coriolis Pharma",
      "Coripharma",
      "Cristália",
      "CSL",
      "Curium Pharma",
    ],
    D: [
      "Daiichi Sankyo",
      "Dali Medical Devices",
      "Debiopharm",
      "Dechra",
      "Delpharm",
      "DelSiTech",
      "Denk Pharma",
      "Destiny Pharma",
      "DEVA Holding",
      "Develco Pharma Schweiz",
      "Dinaqor",
      "Dipharma",
      "Directbiologics",
      "Dompé",
      "Drehm Pharma",
      "DSM",
    ],
    E: [
      "ECRIN",
      "Ecuphar",
      "Egis",
      "Elpen Pharmaceutical",
      "Emergent BioSolutions",
      "Endo International",
      "Enzyvant",
      "Ergomed",
      "Etherna",
      "Eurofins",
      "EUSA Pharma",
      "EVER Neuro Pharma",
      "Evonik Industries",
      "Evotec",
      "Evox Therapeutics",
      "ExcellGene",
      "Exeltis",
    ],
    F: [
      "Faes farma",
      "Fair-med",
      "FAREVA",
      "FARMAK",
      "Farmhispania",
      "Farmigea",
      "Ferraz",
      "Ferring",
      "FinVector",
      "Flatiron Health",
      "Formycon",
      "Fresenius Kabi",
      "Fujifilm",
    ],
    G: [
      "Galapagos",
      "Galderma",
      "Galenicum",
      "Gap",
      "GEA",
      "Gebro Pharma España",
      "Gedeon Richter",
      "Geiser Pharma",
      "Geistlich Pharma",
      "Gen",
      "Genentech",
      "Genepharm",
      "Genericon Pharma",
      "Generis Farmaceutica",
      "Généthon",
      "Genibet",
      "Genmab",
      "GenSight Biologics",
      "Gerson Lehrman",
      "Gilead Sciences",
      "Gl Pharma",
      "GLATT",
      "Glycostem Therapeutics",
      "Grifols",
      "Grindeks",
      "Grünenthal",
      "Grupo Medinfar",
      "GSK",
      "Guerbet",
      "Gyroscope Therapeutics",
    ],
    H: [
      "H. Lundbeck",
      "Hameln Pharmaceuticals",
      "Handl Therapeutics",
      "Hansa Biopharma",
      "HBM Pharma",
      "Helmag",
      "Hemofarm",
      "Hillrom",
      "Holostem Terapie Avanzate",
      "Hookipa Pharma",
      "Horizon Therapeutics",
      "Hovione",
    ],
    I: [
      "Iberfar, Indústria Farmacêutica",
      "IBSA Institut Biochimique",
      "Ichnos Sciences",
      "Idorsia",
      "IDT Biologika",
      "Imcyse",
      "Immunicum",
      "ImmunoGen",
      "Incyte Corporation",
      "Industrie Biomediche Insubri",
      "InFlectis BioScience",
      "Innate Pharma",
      "Institut Pasteur",
      "Intas Pharmaceuticals",
      "Intersurgical",
      "Invectys",
      "Ipsen",
      "IQVIA",
      "Italfarmaco",
      "Ivoclar Vivadent",
      "Ixaka",
    ],
    J: ["Jansenn", "JGL", "Johnson & Johnson Services", "JSC Olainfarm"],
    K: [
      "Kalvista Pharmaceuticals",
      "Kamada",
      "Kantar Health",
      "Kedrion Biopharma",
      "Kentpharm",
      "KinBio",
      "Klinika Quinta",
      "Komtur Pharmaceuticals",
      "Krka",
      "Krones",
      "Kusum Pharm",
      "Kyowa Hakko Kirin",
    ],
    L: [
      "Labatec",
      "LabCorp",
      "Labomed",
      "Laboratoires URGO",
      "Laboratori Rubió",
      "Laboserve",
      "Lagap",
      "Lamda Lamboratories",
      "Laminar Pharma",
      "Lannett",
      "Lavet Pharmaceuticals",
      "Legacy Healthcare",
      "LEO Pharma",
      "Lesaffre",
      "Locanabio",
      "Lonza",
      "Lundbeck",
      "Lupin",
      "Lyfjastofnun",
    ],
    M: [
      "mAbxience",
      "Malta Medicines Authority",
      "McKesson",
      "Medac",
      "Medexus Pharma",
      "Medi-Radiopharma",
      "Medichem",
      "MedinCell",
      "Medlumics",
      "Medochemie",
      "Medpace",
      "Menarini",
      "Merck",
      "Merus",
      "Merz Pharma",
      "Metagenics Europe",
      "Midas Pharma",
      "Miltenyi Biotec",
      "Minoryx Therapeutics",
      "Mithra Pharmaceuticals",
      "Molteni Farmaceutici",
      "MorphoSys",
      "MSD",
      "Mundipharma",
      "Myrtellegtx",
    ],
    N: [
      "Nabriva Therapeutics",
      "Nanomi",
      "Nanovi",
      "Naslovnica",
      "NDA Group",
      "Neuraxpharm",
      "Nipro Europe",
      "Northumbria Pharma",
      "Northway Biotech",
      "Novartis",
      "Novavax",
      "Novo Nordisk",
    ],
    O: [
      "Octapharma",
      "Olainfarm",
      "OM Pharma",
      "Oncoinvent",
      "Oncopeptides",
      "One Pharma",
      "Organon",
      "Orifarm",
      "Oriflame",
      "Orion Corporation",
      "Orphan-Reach",
      "Orphazyme",
      "Oryzon Genomics",
      "Otsuka Pharmaceutical",
      "Oxford BioMedica",
      "Oximio",
      "OxThera",
    ],
    P: [
      "Pall Corporation",
      "Pfizer",
      "PhaRA",
      "PharmaCept",
      "Pharmacosmos",
      "PharmaMar",
      "Pharmaron",
      "Pharmathen",
      "PharOS",
      "Phoenix Pharma",
      "Pierre Fabre",
      "Plazmaszolgalat",
      "PLIVA",
      "Pluristem",
      "Poietis",
      "Polfa Tarchomin",
      "Polpharma",
      "Polymun",
      "ProBioGen",
      "Procos",
      "ProductLife Group",
      "Prolytic",
      "ProQR Therapeutics",
      "Proveca",
      "Pure Biologics SA",
      "Purple Biotech",
    ],
    Q: ["QPharma", "QualiMetrix", "Quay Pharma", "Quotient"],
    R: [
      "RAFARM",
      "Ravimiamet",
      "Recipharm",
      "Regeneron",
      "REGENXBIO",
      "Reig Jofre",
      "Rentschler Biopharma",
      "Repligen Corporation",
      "Rexgenero",
      "Richter Pharma",
      "Roche",
      "Rontis",
      "RTI Health Solutions",
      "Rvacmed",
    ],
    S: [
      "Sandoz",
      "Saneca Pharmaceuticals",
      "Sangamo Therapeutics",
      "Saniona",
      "Sanofi",
      "Santen",
      "Sarepta Therapeutics",
      "Sartorius Stedim Biotech",
      "Savara",
      "Selectchemie",
      "SEQENS",
      "Seqirus",
      "Serviers",
      "SIA Pharmidea",
      "Sintetica",
      "Skyepharma",
      "Solvias",
      "Sotio",
      "Spark Therapeutics",
      "STADA",
      "Sterling",
      "Stevanato Group",
      "Sun Pharma",
      "Supernus Pharmaceuticals",
      "Symeres",
      "Syngoi Technologies",
      "Syntese",
      "Synthon",
    ],
    T: [
      "Tabuk Pharmaceuticals",
      "Takeda",
      "Taro Pharmaceutical Industries",
      "TCR² Therapeutics",
      "Tecnimede",
      "Teva Pharmaceutical",
      "Theramex",
      "Thermo Fisher Scientific",
      "TreeFrog Therapeutics",
    ],
    U: [
      "UCB",
      "Ultragenyx Pharmaceutical",
      "Uniphar Group",
      "Unipharm",
      "UniQure",
      "Unither Pharma",
      "Unizima",
      "Uriach",
    ],
    V: [
      "Vaccibody",
      "Valneva",
      "Valpharma",
      "Vaxxinova",
      "VBI Vaccines",
      "VectorBuilder",
      "VectorY",
      "Veramed",
      "Vertex",
      "Veryanmed",
      "Vianex",
      "Viatris",
      "Vico Therapeutics",
      "Vifor Pharma",
      "Viralgen Vector Core",
      "Vironova",
      "ViruSure",
      "Visterra",
    ],
    W: ["Welding", "Werfen", "Wockhardt", "Wörwag Pharma", "WuXi Biologics"],
    X: [
      "Xbrane Biopharma",
      "Xellia Pharmaceuticals",
      "Xenon Pharmaceuticals",
      "Xeolas Pharmaceuticals",
    ],
    Y: ["Yuria-Pharm", "Yxion"],
    Z: ["Zentiva", "Ziccum", "Ziphius Vaccines"],
  };

  return (
    <div>
      <PageHeader
        title="Our Clients"
        description="We are proud to work with leading pharmaceutical and biotech companies worldwide. Our comprehensive training programs have benefited professionals from over 500 companies across the globe."
      />

      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid grid-cols-1 gap-8 text-center text-white md:grid-cols-3">
            <div>
              <div className="mb-2 text-3xl font-bold">500+</div>
              <div className="text-2xl">Companies</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold">50+</div>
              <div className="text-2xl">Countries</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold">10,000+</div>
              <div className="text-2xl">Professionals Trained</div>
            </div>
          </div>
        </div>
      </section>

      <ClientLogosCarousel />

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h3 className="mb-12 text-center text-2xl text-gray-800">
            Testimonials
          </h3>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="A great overview of state-of-the art PM in generic business. The discussions on topics from real experience with Dr. Ross were especially interesting given his broad area of expertise because it's all related!"
              author="Jiří Václavík"
              position="Project Manager"
              company="Zentiva"
            />
            <TestimonialCard
              quote="It was a good overview on Project Management tools and skills. A good starting point for PM implementation."
              author="Catarina Estevens"
              position="Project Manager Pharmaceutical"
              company="Development Tecnimede"
            />
            <TestimonialCard
              quote="Very rich content with real world examples. Trainer is very strong in rich information/right content. Worth to take this training if your routes cross VAM development."
              author="Araksya Topchyan"
              position="Global Marketing Manager Pharma"
              company="DSM"
            />
          </div>
        </div>
      </section>

      {/* Clients Listing */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(clients).map(([letter, companyList]) => (
              <div key={letter} className="bg-white">
                <div className="sticky top-20">
                  <h2 className="mb-6 border-b-2 border-blue-600 pb-2 text-3xl font-bold text-blue-600">
                    {letter}
                  </h2>
                  <div className="space-y-2">
                    {companyList.map((company, index) => (
                      <div
                        key={index}
                        className="py-1 text-gray-700 transition-colors duration-200 hover:text-blue-600"
                      >
                        {company}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
