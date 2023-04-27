import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { SignIn } from "@clerk/nextjs";
import { api } from "~/utils/api";
import Image from "next/image";
import { PageLayout } from "~/components/layouts";
import { PostView } from "~/components/postview";
import { helpers } from "~/server/helpers/ssgHelper";

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
        <div className=" grid h-48 grid-cols-4 border drop-shadow-md">
          <div className=" col-span-1 flex items-center justify-center">
            <Image
              src={data.profilePicture}
              alt={`Foto de perfil de ${data.username ?? ""} `}
              width={128}
              height={128}
              className="  rounded-full  border-2 border-black "
            />
          </div>
          <div className="col-span-2 flex items-center justify-center text-5xl ">
            <h1 className="drop-shadow-xl">{`@${data.username ?? ""}`}</h1>
          </div>
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
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
