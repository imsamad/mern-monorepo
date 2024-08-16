import { prismaClient, User } from "@repo/db";
import * as bcryptjs from "bcryptjs";

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  CustomError,
  CustomResponseError,
  generateOTP,
  TCustomError,
  TCustomResponseError,
} from "@repo/utils";

import { sendEmail } from "../lib/sendEmail";
import { AUTH_COOKIE_NAME } from "../lib/const";

export const logout = async (_: Request, res: Response) => {
  res.cookie(AUTH_COOKIE_NAME, "", { maxAge: 0 });
  res.json("logout!");
};

export const getMe = async (req: Request, res: Response) => {
  res.json({
    user: {
      id: req.user?.id! as string,
      username: req.user?.username!,
      email: req.user?.email!,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prismaClient.user.findUnique({
    where: { email, emailVerified: { not: null } },
  });

  if (!user) {
    throw new CustomResponseError(404, {
      message: { email: "user not found" },
    });
  }

  const isPwdValid = await bcryptjs.compare(password, user.password);

  if (!isPwdValid)
    throw new CustomResponseError(404, {
      message: { password: "invalid password!" },
    });

  const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    // seconds
    expiresIn: 60 * 60 * (parseInt(process.env.JWT_EXPIRE_IN_HR!, 10) || 1),
  });

  res.cookie(AUTH_COOKIE_NAME, jwtToken, {
    // ms
    maxAge: 60 * 60 * 1000 * (parseInt(process.env.JWT_EXPIRE_IN_HR!, 10) || 1),
    secure: process.env.NODE_ENV == "production",
    httpOnly: true,
    sameSite: "strict",
  });

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

export const signUp = async (req: Request, res: Response) => {
  let _otp = "";
  const body: {
    email: string;
    password: string;
  } = req.body;

  let { email, password } = body;

  if (
    await prismaClient.user.findUnique({
      where: {
        email,
      },
    })
  ) {
    throw new CustomResponseError(404, {
      message: { email: "This email is already taken!" },
    });
  }

  const salt = await bcryptjs.genSalt(parseInt(process.env.SALT_SIZE!) || 10);

  const user: User = await prismaClient.$transaction(async (txn) => {
    try {
      const userCreated = await txn.user.create({
        data: {
          fullName: "",
          email,
          password: bcryptjs.hashSync(password, salt),
          emailVerified: null,
          phoneNumber: null,
          username: Math.random().toString().slice(10),
        },
      });

      const token = generateOTP(6);
      _otp = token;
      await txn.verificationToken.create({
        data: {
          identifier: userCreated.id,
          token,
        },
      });

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS)
        await sendEmail({
          to: email,
          subject: "Email confirmation OTP!",
          html: `<h3>OTP:${token}</h3>`,
        });

      return userCreated;
    } catch (err) {
      if (err instanceof TCustomResponseError || err instanceof TCustomError)
        throw err;

      throw new CustomError(err);
    }
  });

  res.json({
    userId: user.id,
    message: "Registred successfully, plz verify email!",
    otp: process.env.NODE_ENV == "production" ? undefined : _otp,
  });
};

export const confirmOTP = async (req: Request, res: Response) => {
  const token = await prismaClient.verificationToken.findFirst({
    where: {
      token: req.params.token,
    },
  });

  if (!token)
    throw new CustomResponseError(404, {
      message: "OTP Not Found!",
    });

  const tenMinutesAgo = new Date(
    new Date().getTime() -
      parseInt(process.env.OTP_EXPIRE_IN_MIN!, 10) * 60 * 1000,
  );

  if (tenMinutesAgo >= new Date(token?.createdAt)) {
    throw new CustomResponseError(403, {
      message: "Token expired!",
    });
  }

  await prismaClient.verificationToken.delete({ where: { id: token.id } });
  const user = await prismaClient.user.update({
    where: { id: token.identifier },
    data: {
      emailVerified: new Date(),
    },
  });

  // bcoz in profile, does not have a foreign key to link it with the owning user,
  // might be better to create ahead of time
  await prismaClient.profile.create({
    data: {
      id: user.id,
    },
  });

  res.json({
    message: "Authorised",
  });
};

export const resendOTP = async (req: Request, res: Response) => {
  const vToken = await prismaClient.verificationToken.findFirst({
    where: {
      identifier: req.params.userId,
    },
  });

  if (!vToken)
    throw new CustomResponseError(404, {
      message: "What is this!",
    });
  else {
    const minutesAgo = new Date(
      new Date().getTime() -
        parseInt(process.env.OTP_RETRY_IN_MIN!, 10) * 60 * 1000,
    );

    if (minutesAgo < new Date(vToken.createdAt)) {
      throw new CustomResponseError(403, {
        message: "Had sent!",
      });
    }
  }

  const user = await prismaClient.user.findFirst({
    where: { id: req.params.userId },
  });

  if (!user)
    throw new CustomResponseError(404, {
      message: "What is this!",
    });

  const token = generateOTP(6);

  await prismaClient.verificationToken.upsert({
    where: { identifier: user.id },
    update: {
      token,
      createdAt: new Date(),
    },
    create: {
      token,
      createdAt: new Date(),
      identifier: user.id,
    },
  });
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS)
    await sendEmail({
      to: user.email,
      subject: "Email confirmation OTP!",
      html: `<h3>OTP:${token}</h3>`,
    });

  res.json({
    mesaage: "OTP sent!",
  });
};
