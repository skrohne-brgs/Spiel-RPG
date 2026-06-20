export interface CityDef {
  id: string;
  name: string;
  description: string;
  tileX: number;
  tileY: number;
  recruitOptions: Array<{ unitId: string; cost: number; available: number }>;
}

export const CITIES: CityDef[] = [
  {
    id: 'annuminas',
    name: 'Annúminas',
    description: 'Hauptstadt von Arnor, erbaut von Elendil am Nenuial-See.',
    tileX: 5, tileY: 2,
    recruitOptions: [
      { unitId: 'numenorean_warrior', cost: 50,  available: 20 },
      { unitId: 'numenorean_archer',  cost: 70,  available: 10 },
    ],
  },
  {
    id: 'lond_daer',
    name: 'Lond Daer',
    description: 'Alter Númenórischer Hafen an der Brandymündung.',
    tileX: 3, tileY: 8,
    recruitOptions: [
      { unitId: 'numenorean_warrior', cost: 50,  available: 10 },
      { unitId: 'dunedain_ranger',    cost: 90,  available: 8  },
    ],
  },
  {
    id: 'imladris',
    name: 'Bruchtal',
    description: 'Elronds Zuflucht. Gil-galads Krieger sammeln sich hier.',
    tileX: 10, tileY: 3,
    recruitOptions: [
      { unitId: 'elven_warrior',   cost: 120, available: 10 },
      { unitId: 'elven_cavalry',   cost: 180, available: 5  },
      { unitId: 'dunedain_ranger', cost: 90,  available: 6  },
    ],
  },
];
