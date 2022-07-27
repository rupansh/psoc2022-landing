import { Role } from "@prisma/client";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/deps/prisma";
import { errResp, expressRes, expressUnwrappErr } from "../../../lib/helpers/apiResp";
import { getAuthUser } from "../../../lib/helpers/auth";
import { CreateProjectReq } from "../../../lib/requests/createProject";

const ERR_NOT_MENTOR = errResp(403, "You are not a mentor");

async function handler(req: NextApiRequest, res: NextApiResponse, createParams: CreateProjectReq) {
    const user = await getAuthUser(req, { mentor: { select: { id: true } } })
    if (isLeft(user)) return expressUnwrappErr(res, user);
    if (!user.right.mentor) return expressUnwrappErr(res, left(ERR_NOT_MENTOR));

    const project = await prisma.project.create({
        data: {
            name: createParams.name,
            url: createParams.url,
            description: createParams.description,
            mentor: { connect: { id: user.right.mentor.id } }
        },
    });

    return expressRes(res, right({ id: project.id }));
}