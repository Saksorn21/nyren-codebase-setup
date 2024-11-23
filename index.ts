const obj = {
  name: 'John',
  age: 30,
  city: 'New York',
  loc: {
    lat: 40.7128,
    lng: -74.0060,
    map: (l: string) => { 
      throw new Error(l)
      }
  }
}
obj.name
obj.loc.map('heolo')