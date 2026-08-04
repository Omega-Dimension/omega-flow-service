import { IsEnum } from "class-validator";
import { WorkspaceType } from "../../libs/interfaces/workspace";

export class UpdateDefaultWorkspaceDto {
  @IsEnum(WorkspaceType)
  workspace: WorkspaceType;
}