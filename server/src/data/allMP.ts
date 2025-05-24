interface MP {
  name: string;
  political_party: string;
  interests: string[];
  imageUrl?: string;
}

export const allMPs: MP[] = [
  {
    name: 'Alice Thompson',
    political_party: 'Labour',
    interests: ['Healthcare', 'Education'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4754/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Ben Turner',
    political_party: 'Conservative',
    interests: ['Economy', 'International Trade'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4755/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Clara Patel',
    political_party: 'Liberal Democrats',
    interests: ['Digital Economy', 'Innovation'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4756/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'David Nguyen',
    political_party: 'Green Party',
    interests: ['Environment', 'Climate Change'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4757/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Emma O’Connor',
    political_party: 'SNP',
    interests: ['Health', 'Social Care'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4758/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Frank Williams',
    political_party: 'Plaid Cymru',
    interests: ['Rural Affairs', 'Agriculture'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4759/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Grace Lee',
    political_party: 'Independent',
    interests: ['Justice', 'Equality'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4760/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Harry Singh',
    political_party: 'Labour',
    interests: ['Transport', 'Infrastructure'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4761/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Isabella Khan',
    political_party: 'Conservative',
    interests: ['Defense', 'Foreign Affairs'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4762/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Jack Murphy',
    political_party: 'Liberal Democrats',
    interests: ['Housing', 'Homelessness'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4763/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Keira Brooks',
    political_party: 'Green Party',
    interests: ['Energy', 'Industry'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4764/Portrait?cropType=ThreeFour&webVersion=false',
  },
  {
    name: 'Liam Roberts',
    political_party: 'Labour',
    interests: ['Immigration', 'Human Rights'],
    imageUrl:
      'https://members-api.parliament.uk/api/Members/4765/Portrait?cropType=ThreeFour&webVersion=false',
  },
];
