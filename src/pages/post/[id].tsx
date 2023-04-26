import { type NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { SignIn, SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layouts";
const SinglePost: NextPage = () => {
  return (
    <>
      <Head>
        <title>Perfil</title>
      </Head>
      <PageLayout>
        <div className="flex h-auto justify-center  ">
          Soy un post!
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
      </PageLayout>
    </>
  );
};

export default SinglePost;
