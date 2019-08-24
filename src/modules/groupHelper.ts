import database from "../database";
import { GroupInstance } from "../models/group";
import { UserGroupInstance } from "../models/user_group";
import { Role } from "../config";
export async function updateGroup(groupId: string): Promise<GroupInstance> {
  if (!groupId) {
    return Promise.reject("group id not found");
  }

  const [record, created] = await database.Group.upsert(
    { id: groupId },
    { returning: true }
  );
  return record;
}

export async function getManageGroups(
  userId: string
): Promise<UserGroupInstance[]> {
  const groups = await database.UserGroup.findAll({
    where: {
      userId: userId,
      role: { $gte: Role.Manager }
    }
  });
  return groups;
}
