import { type NextPage } from "next";
import Image from "next/image";
import { SignIn, SignInButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layouts";
import { PostView } from "~/components/postview";

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
