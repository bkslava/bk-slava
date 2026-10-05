// English counterparts of the data in content.ts. Slugs, ids and image names are shared
// (they identify routes and files); only the visible text is translated.
import type { Service } from "./content";

export const servicesEn: Service[] = [
  {
    slug: "remont-pid-klyuch",
    name: "Turnkey renovation",
    short: "From the initial plan to a finished space.",
    image: "hero",
    intro:
      "We manage each renovation as one coordinated process. Preparation, plumbing and electrical work, and finishing follow a clear sequence, with each stage building on the last.",
    scope: ["Apartments", "Private houses", "Offices", "Shops", "Commercial premises"],
    details: [
      "We plan the order of work around the condition of the apartment and your everyday needs.",
      "We agree on solutions for living areas, utility spaces and building services.",
      "We plan the layout, lighting and materials around the daily use of the space.",
      "We prepare space for equipment and make it comfortable for visitors.",
      "We adapt the scope of renovation to the purpose of the premises and how they are used.",
    ],
    result:
      "A finished space with level surfaces, neat junctions, well-planned lighting and working building services.",
  },
  {
    slug: "demontazh",
    name: "Demolition work",
    short: "A clean start for a new project.",
    image: "before",
    intro:
      "We inspect the space and agree on what to remove and what to keep. During demolition, we take care around building services and adjacent surfaces, keeping the next stages of renovation in mind.",
    scope: [
      "Partitions",
      "Tiles",
      "Flooring",
      "Old coverings",
      "Drywall",
      "Site preparation",
      "Construction waste removal",
    ],
    details: [
      "We take down non-load-bearing partitions once the scope has been agreed and any restrictions checked.",
      "We remove wall and floor tiles and prepare the base for the work that follows.",
      "We remove old flooring and any underlying layers included in the agreed scope.",
      "We strip wallpaper, paint and finishes that are no longer suitable for the renovation.",
      "We dismantle old drywall ceilings, enclosures and partitions.",
      "We clear the work area and expose the surfaces needed for the next stage.",
      "We arrange the collection and removal of leftover materials.",
    ],
    result: "A cleared space with exposed surfaces, ready for the next stage of work.",
  },
  {
    slug: "gipsokarton",
    name: "Drywall construction",
    short: "Partitions, ceilings and details that shape the space.",
    image: "drywall",
    intro:
      "We build drywall structures around the planned layout. We consider how the room will be used, structural loads, access to building services and the finish to be applied later.",
    scope: [
      "Partitions",
      "Ceilings",
      "Service enclosures",
      "Niches",
      "Decorative structures",
      "Preparation for finishing",
    ],
    details: [
      "We install framing and drywall to divide the space, adding supports where the design calls for them.",
      "We create level ceiling surfaces, including any agreed changes in height and lighting zones.",
      "We conceal building services neatly while keeping inspection points accessible.",
      "We build recessed spaces for furniture, lighting and storage.",
      "We create the architectural details specified in the design, with neat junctions.",
      "We finish the joints and prepare the surfaces for the chosen finish.",
    ],
    result:
      "Level surfaces and neatly joined structures, ready for final finishing.",
  },
  {
    slug: "steli",
    name: "Suspended ceilings",
    short: "Armstrong, Grilyato and slatted ceiling systems.",
    image: "ceiling",
    intro:
      "We choose a ceiling system to suit the space. We agree on the ceiling height, lighting, access to building services and the look of the finished interior.",
    scope: ["Armstrong ceilings", "Grilyato ceilings", "Slatted ceilings"],
    details: [
      "Modular tile ceilings for offices and commercial spaces, with access to the space above and replaceable individual tiles.",
      "Open-grid ceilings for commercial spaces, installed with consistent spacing and alignment.",
      "Linear metal ceilings for technical and public areas. We agree on the direction of the slats and how they meet the walls.",
    ],
    result:
      "A ceiling that suits the interior, accommodates building services and remains easy to maintain.",
  },
  {
    slug: "ozdoblennya",
    name: "Interior finishing",
    short: "Finishes and details you live with every day.",
    image: "house",
    intro:
      "A good finish starts with proper surface preparation. We check the surfaces, plan the preparation and agree on materials before finishing begins.",
    scope: [
      "Surface filling and skimming",
      "Painting",
      "Plastering",
      "Tiling",
      "Laminate flooring",
      "Vinyl flooring",
      "Other flooring",
      "Finishing details",
    ],
    details: [
      "We prepare even surfaces to suit the chosen paint or other finish.",
      "We paint walls and ceilings, paying attention to corners, natural light and an even finish.",
      "We level the underlying surfaces and establish the room’s geometry.",
      "We agree on the tile layout, prepare the surface and install the tiles.",
      "We lay laminate over a suitable subfloor, allowing for the required expansion gaps.",
      "We prepare the subfloor and install vinyl according to the chosen system.",
      "We prepare the subfloor and carry out the agreed flooring work.",
      "We finish the junctions, skirting boards and small details that bring the interior together.",
    ],
    result:
      "A finished interior with neat corners, even surfaces and coordinated textures.",
  },
  {
    slug: "santehnika-elektryka",
    name: "Plumbing and electrical work",
    short: "A reliable foundation for everyday comfort.",
    image: "bathroom",
    intro:
      "We plan the plumbing and electrical work before walls and floors are closed up. We consider fixture locations, access for maintenance and the project requirements.",
    scope: [
      "Water supply lines",
      "Wastewater drainage",
      "Plumbing fixture installation",
      "Electrical wiring",
      "Sockets and switches",
      "Lighting",
    ],
    details: [
      "We run the agreed cold and hot water lines.",
      "We route drainage to suit the position of the fixtures.",
      "We install the plumbing fixtures and check the connections.",
      "We install wiring within the agreed design and renovation scope.",
      "We position outlets and switches according to the furniture and equipment plan.",
      "We prepare the connections and install the agreed lighting fixtures.",
    ],
    result:
      "Plumbing and electrical systems planned for everyday use and access for maintenance.",
  },
  {
    slug: "zagalnobudivelni-roboty",
    name: "General construction work",
    short: "Cast-in-place concrete and masonry for a strong structural base.",
    image: "general-construction",
    intro:
      "We build the structural elements of a property, from cast-in-place concrete to brick and block walls. We follow the agreed design, coordinate the work sequence and material deliveries, and check that each structure is ready for the next stage of construction.",
    scope: [
      "Cast-in-place concrete",
      "Brick and block masonry",
      "Construction planning",
      "Inspections and stage handover",
    ],
    details: [
      "We build cast-in-place reinforced concrete foundations, columns, ring beams and floor slabs as specified in the design. We install formwork and reinforcement, check embedded components before the pour, and manage concrete placement, compaction and curing according to site conditions.",
      "We build external and internal walls and partitions from brick or blocks in line with the design. We prepare the base, mark out wall positions and openings, and check the bond, joint thickness, alignment and level of the masonry. We install lintels, reinforcement and connections where the design requires them.",
      "Before work begins, we plan the work areas, site access and material storage. We coordinate concrete and masonry work with adjacent stages, keep the work area orderly and allow time for the required curing and other construction intervals.",
      "We check structural dimensions, levels and opening positions. We inspect reinforcement and embedded components before concreting, and completed surfaces before plumbing, electrical and finishing work begins. Together with the client, we check the completed work against the agreed scope.",
    ],
    result:
      "Sound concrete structures and level masonry walls, built to the agreed design and ready for the next stages of construction and finishing.",
  },
];

export const projectsEn = [
  {
    id: "svitla-kvartyra",
    service: "remont-pid-klyuch",
    title: "Light and calm",
    type: "Turnkey renovation",
    category: "Residential spaces",
    image: "after",
    text: "An apartment concept with an open living room, natural textures and a deep green accent. It shows how the layout, finishes and lighting can work together.",
  },
  {
    id: "zamiskyi-dim",
    service: "ozdoblennya",
    title: "A house with character",
    type: "Interior finishing",
    category: "Residential spaces",
    image: "house",
    text: "A visual concept for a country house, with warm wood, even mineral surfaces and understated details.",
  },
  {
    id: "suchasnyi-ofis",
    service: "steli",
    title: "An office with room to focus",
    type: "Grilyato ceilings",
    category: "Commercial spaces",
    image: "office",
    text: "An office concept with clear zones and an open-grid ceiling. The layout balances practical use with comfortable lighting.",
  },
  {
    id: "vanna-kimnata",
    service: "santehnika-elektryka",
    title: "A bathroom designed for daily use",
    type: "Plumbing and interior finishing",
    category: "Interior finishing",
    image: "bathroom",
    text: "A bathroom concept with large-format tiles, compact storage and neatly arranged plumbing connections.",
  },
  {
    id: "gipsokarton-protses",
    service: "gipsokarton",
    title: "Shaping the new layout",
    type: "Drywall construction",
    category: "Preparation and installation",
    image: "drywall",
    text: "Drywall installation: a partition, a recess and framing that define the new layout.",
  },
  {
    id: "armstrong-ofis",
    service: "steli",
    title: "A clean ceiling grid",
    type: "Armstrong ceilings",
    category: "Commercial spaces",
    image: "ceiling",
    text: "A workspace concept with a modular tile ceiling, an even grid and integrated lighting.",
  },
];

export const stepsEn = [
  ["Initial discussion", "We discuss your property, your needs and the result you want."],
  ["Planning", "We inspect the property and agree on the scope, materials and sequence of work."],
  ["Construction", "We work through each stage and discuss decisions that affect the result."],
  ["Handover", "We inspect the completed work together and check the final details."],
];

export const reviewDraftsEn = [
  {
    name: "Andrii",
    place: "Kyiv",
    text: "I wanted one contractor for my apartment renovation. We discussed each stage in advance and worked through the details as the project progressed. I’m especially pleased with the living room.",
  },
  {
    name: "Oleksandra",
    place: "Irpin",
    text: "I needed the old tiles removed and the bathroom prepared. It mattered to me that we agreed from the start on what would be removed and what would stay.",
  },
  {
    name: "Viktor",
    place: "Bucha",
    text: "I had a drywall partition installed in an office. We discussed the doorway and space for shelving, and the partition fits the room well.",
  },
  {
    name: "Olha",
    place: "Bilohorodka",
    text: "I spent a long time choosing the wall colour. Once the walls were prepared and painted, the room was as bright as I’d imagined. The corners and areas around the windows look neat.",
  },
  {
    name: "Serhii",
    place: "Brovary",
    text: "We chose an Armstrong ceiling for the office. I appreciated discussing the lighting and access to building services before installation.",
  },
  {
    name: "Nataliia",
    place: "Vyshneve",
    text: "We had plumbing work done in the bathroom. We agreed where the washing machine would go, and the connections were placed accordingly. The layout works well for us.",
  },
  {
    name: "Dmytro",
    place: "Vasylkiv",
    text: "Several electrical points in the house needed to be reworked. We went through the rooms with the furniture plan first. I’m glad we sorted it out early.",
  },
  {
    name: "Iryna",
    place: "Hostomel",
    text: "We chose vinyl flooring. The subfloor needed more attention than we expected, but I now understand why the preparation matters.",
  },
  {
    name: "Taras",
    place: "Boryspil",
    text: "The Grilyato ceiling changed the look of our space. The edges where it meets the walls and lighting were finished neatly.",
  },
  {
    name: "Maryna",
    place: "Petropavlivska Borshchahivka",
    text: "The renovation happened in stages: demolition, then walls and finishing. Being able to discuss decisions along the way mattered to me. We ended up with a simple, comfortable space without unnecessary details.",
  },
];
