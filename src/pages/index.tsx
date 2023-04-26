import { type NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { SignIn, SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layouts";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState<string>("");

  // Consigo el contexto de todo a traves de la API
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      // Consigo todos los posts y los invalido para que se vuelvan a pedir
      setInput(""), void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Algo salio mal");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex gap-4">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        className="h-24 w-24 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Escribe algo!"
        className="grow bg-transparent text-slate-100 outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      {input !== "" && input.length < 101 && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Publicar</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex border-b border-slate-300 p-4">
      <Image
        src={author.profilePicture}
        className="h-24 w-24 rounded-full  "
        alt="`@${author.username}`'s foto de perfil"
        width={56}
        height={56}
      />
      <div className="flex flex-col p-4 ">
        <div className="between flex">
          <Link href={`/@${author.username}`}>
            {" "}
            <span>{`@${author.username}`}</span>
          </Link>
        </div>
        <Link href={`/post/${post.id}`}>{post.content} </Link>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>Oops! Algo salio mal.</div>;
  return (
    <div>
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Fetch lo antes posible
  api.posts.getAll.useQuery();

  // Div vacio si no esta cargado para el usuario
  if (!userLoaded) return <LoadingPage />;

  return (
    <PageLayout>
      <div className="border-b border-slate-200 p-4">
        {!isSignedIn && <SignInButton />}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </PageLayout>
  );
};

export default Home;
