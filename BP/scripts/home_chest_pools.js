/** House red-dot seats — indoor covered only. */
export const HOME_CHEST_POOLS = {
  "1": [
    [11, 2, 10],
    [11, 2, 11],
    [12, 2, 12],
    [11, 1, 8],
    [13, 1, 10],
    [15, 1, 8],
    [15, 1, 10],
    [14, 1, 11],
    [16, 1, 9],
    [16, 1, 10],
    [17, 1, 9],
    [17, 1, 13],
  ],
  "2": [
    [8, 11, 11],
    [9, 11, 11],
    [10, 11, 10],
    [10, 11, 11],
    [11, 11, 9],
    [11, 11, 10],
    [12, 11, 11],
    [13, 11, 10],
    [13, 11, 12],
    [14, 11, 10],
    [14, 11, 11],
  ],
};
/** Max chests per layer when that layer rolls a chest. Layers may also roll empty. */
export const HOME_CHESTS_PER_FLOOR = { min: 1, max: 3, floorChance: 0.65 };
