import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { SignIn } from "@clerk/nextjs";
import { api } from "~/utils/api";
import Image from "next/image";
import { PageLayout } from "~/components/layouts";
import { PostView } from "~/components/postview";
import { helpers } from "~/server/helpers/ssgHelper";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data, isLoading } = api.posts.getById.useQuery({
    id,
  });

  // No deberia llegar en ningun punto a este estado
  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>No encontrado</div>;
  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await helpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
