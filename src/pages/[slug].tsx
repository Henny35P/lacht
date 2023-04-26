import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { SignIn } from "@clerk/nextjs";
import { api } from "~/utils/api";
import Image from "next/image";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data || data.length === 0) return <div>No hay posts</div>;

  return (
    <div className=" flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  // No deberia llegar en ningun punto a este estado
  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>No encontrado</div>;
  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className=" h-48  border-slate-400 bg-slate-200">
          <Image
            src={data.profilePicture}
            alt={`Foto de perfil de ${data.username ?? ""} `}
            width={128}
            height={128}
            className="-m-2 rounded-full border-2 border-black"
          />

          <div>{data.username}</div>
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/layouts";
import next from "next/types";
import { PostView } from "~/components/postview";

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
