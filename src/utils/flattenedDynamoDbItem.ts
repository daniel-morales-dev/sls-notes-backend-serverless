export const flattenDynamoDBItem = (item: any) => {
  const flattenedItem = {};
  for (const key in item) {
    // Extrae el valor de S o N
    if (item[key].S !== undefined) {
      flattenedItem[key] = item[key].S;
    } else if (item[key].N !== undefined) {
      flattenedItem[key] = Number(item[key].N); // Convierte a número
    }
  }
  return flattenedItem;
};
