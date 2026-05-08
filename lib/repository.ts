import { ObjectId, type Collection } from "mongodb";

import { getDb } from "@/lib/db";
import {
  type DbFeedback,
  type DbProfession,
  type DbResponse,
  type DbSunbed,
  type KioskConfig,
  toProfessionDto,
  toSunbedDto,
} from "@/lib/models";
import { createSunbedTitle } from "@/lib/sunbed-title";

export type DashboardSummary = {
  totalResponses: number;
  totalProfessions: number;
  totalSunbeds: number;
  professionBreakdown: Array<{ professionName: string; count: number }>;
  finalWinnerBreakdown: Array<{
    sunbedId: string;
    title: string;
    imagePath: string;
    count: number;
    percentage: number;
  }>;
};

export async function getCollections() {
  const db = await getDb();

  return {
    professions: db.collection<DbProfession>("professions"),
    sunbeds: db.collection<DbSunbed>("sunbeds"),
    responses: db.collection<DbResponse>("responses"),
    feedbacks: db.collection<DbFeedback>("feedbacks"),
  };
}

export async function getKioskConfig(): Promise<KioskConfig> {
  const { professions, sunbeds } = await getCollections();
  const [professionDocs, sunbedDocs] = await Promise.all([
    professions.find({}).sort({ sortOrder: 1, name: 1 }).toArray(),
    sunbeds.find({}).sort({ sortOrder: 1, title: 1 }).toArray(),
  ]);

  return {
    professions: professionDocs.map(toProfessionDto),
    sunbeds: sunbedDocs.map(toSunbedDto),
  };
}

export async function getAdminDashboardData() {
  const { professions, sunbeds } = await getCollections();
  const [professionDocs, sunbedDocs, summary] = await Promise.all([
    professions.find({}).sort({ sortOrder: 1, name: 1 }).toArray(),
    sunbeds.find({}).sort({ sortOrder: 1, title: 1 }).toArray(),
    getDashboardSummary(),
  ]);

  return {
    professions: professionDocs.map(toProfessionDto),
    sunbeds: sunbedDocs.map(toSunbedDto),
    summary,
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { professions, sunbeds, responses } = await getCollections();
  const [totalResponses, totalProfessions, totalSunbeds, professionGroups] =
    await Promise.all([
      responses.countDocuments({}),
      professions.countDocuments({}),
      sunbeds.countDocuments({}),
      responses
        .aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$professionName", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
        ])
        .toArray(),
    ]);

  const [winnerGroups, sunbedDocs] = await Promise.all([
    responses
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$finalWinnerSunbedId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray(),
    sunbeds.find({}).toArray(),
  ]);
  const sunbedsById = new Map(
    sunbedDocs.map((sunbed) => [sunbed._id.toString(), sunbed]),
  );

  return {
    totalResponses,
    totalProfessions,
    totalSunbeds,
    professionBreakdown: professionGroups.map((group) => ({
      professionName: group._id,
      count: group.count,
    })),
    finalWinnerBreakdown: winnerGroups.map((group) => {
      const sunbed = sunbedsById.get(group._id);

      return {
        sunbedId: group._id,
        title: sunbed?.title ?? "Silinmiş şezlong",
        imagePath: sunbed?.imagePath ?? "",
        count: group.count,
        percentage:
          totalResponses === 0
            ? 0
            : Math.round((group.count / totalResponses) * 100),
      };
    }),
  };
}

export async function createProfession(name: string) {
  const { professions } = await getCollections();
  const now = new Date();
  const sortOrder = await getNextSortOrder(professions);

  await professions.insertOne({
    _id: new ObjectId(),
    name: name.trim(),
    active: true,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateProfession(input: {
  id: string;
  name?: string;
  active?: boolean;
  sortOrder?: number;
}) {
  const { professions } = await getCollections();
  const update: Partial<DbProfession> = { updatedAt: new Date() };

  if (input.name !== undefined) {
    update.name = input.name.trim();
  }
  if (input.active !== undefined) {
    update.active = input.active;
  }
  if (input.sortOrder !== undefined) {
    update.sortOrder = input.sortOrder;
  }

  await professions.updateOne({ _id: toObjectId(input.id) }, { $set: update });
}

export async function deleteProfession(id: string) {
  const { professions } = await getCollections();
  await professions.deleteOne({ _id: toObjectId(id) });
}

export async function createSunbed(input: {
  title: string;
  imagePath: string;
  imageFilename: string;
}) {
  const { sunbeds } = await getCollections();
  const now = new Date();
  const sortOrder = await getNextSortOrder(sunbeds);

  await sunbeds.insertOne({
    _id: new ObjectId(),
    title: input.title.trim(),
    imagePath: input.imagePath,
    imageFilename: input.imageFilename,
    active: true,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  });
}

export async function createSunbeds(
  inputs: Array<{
    imagePath: string;
    imageFilename: string;
  }>,
) {
  if (inputs.length === 0) {
    return;
  }

  const { sunbeds } = await getCollections();
  const now = new Date();
  const startSortOrder = await getNextSortOrder(sunbeds);

  await sunbeds.insertMany(
    inputs.map((input, index) => {
      const sortOrder = startSortOrder + index;

      return {
        _id: new ObjectId(),
        title: createSunbedTitle(sortOrder),
        imagePath: input.imagePath,
        imageFilename: input.imageFilename,
        active: true,
        sortOrder,
        createdAt: now,
        updatedAt: now,
      };
    }),
  );
}

export async function updateSunbed(input: {
  id: string;
  title?: string;
  active?: boolean;
  sortOrder?: number;
}) {
  const { sunbeds } = await getCollections();
  const update: Partial<DbSunbed> = { updatedAt: new Date() };

  if (input.title !== undefined) {
    update.title = input.title.trim();
  }
  if (input.active !== undefined) {
    update.active = input.active;
  }
  if (input.sortOrder !== undefined) {
    update.sortOrder = input.sortOrder;
  }

  await sunbeds.updateOne({ _id: toObjectId(input.id) }, { $set: update });
}

export async function deleteSunbed(id: string) {
  const { sunbeds } = await getCollections();
  const result = await sunbeds.findOneAndDelete({ _id: toObjectId(id) });

  return result;
}

export async function recordKioskResponse(input: Omit<DbResponse, "_id" | "createdAt">) {
  const { responses } = await getCollections();

  await responses.insertOne({
    _id: new ObjectId(),
    ...input,
    createdAt: new Date(),
  });
}

export async function recordKioskFeedback(message: string) {
  const { feedbacks } = await getCollections();

  await feedbacks.insertOne({
    _id: new ObjectId(),
    message,
    createdAt: new Date(),
  });
}

async function getNextSortOrder<TDocument extends { sortOrder: number }>(
  collection: Collection<TDocument>,
) {
  const lastItem = await collection
    .find({})
    .sort({ sortOrder: -1 })
    .limit(1)
    .next();

  return (lastItem?.sortOrder ?? 0) + 1;
}

export function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid MongoDB id.");
  }

  return new ObjectId(id);
}
