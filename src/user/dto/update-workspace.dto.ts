import { IsEnum } from "class-validator";

export enum WorkspaceType {
  FREELANCER = "freelancer",
  CLIENT = "client",
}

export class UpdateDefaultWorkspaceDto {
  @IsEnum(WorkspaceType)
  workspace: WorkspaceType;
}