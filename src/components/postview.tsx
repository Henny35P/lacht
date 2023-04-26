import Image from "next/image";
import { RouterOutputs, api } from "~/utils/api";
import Link from "next/link";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
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
