import { ObjectId } from "mongodb";

export type DbProfession = {
  _id: ObjectId;
  name: string;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DbSunbed = {
  _id: ObjectId;
  title: string;
  imagePath: string;
  imageFilename: string;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DbResponse = {
  _id: ObjectId;
  professionId: string;
  professionName: string;
  comparisons: Array<{
    round: number;
    leftSunbedId: string;
    rightSunbedId: string;
    winnerSunbedId: string;
    loserSunbedId: string;
  }>;
  finalWinnerSunbedId: string;
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
};

export type DbFeedback = {
  _id: ObjectId;
  message: string;
  createdAt: Date;
};

export type ProfessionDto = {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
};

export type SunbedDto = {
  id: string;
  title: string;
  imagePath: string;
  imageFilename: string;
  active: boolean;
  sortOrder: number;
};

export type KioskConfig = {
  professions: ProfessionDto[];
  sunbeds: SunbedDto[];
};

export function toProfessionDto(profession: DbProfession): ProfessionDto {
  return {
    id: profession._id.toString(),
    name: profession.name,
    active: profession.active,
    sortOrder: profession.sortOrder,
  };
}

export function toSunbedDto(sunbed: DbSunbed): SunbedDto {
  return {
    id: sunbed._id.toString(),
    title: sunbed.title,
    imagePath: sunbed.imagePath,
    imageFilename: sunbed.imageFilename,
    active: sunbed.active,
    sortOrder: sunbed.sortOrder,
  };
}
