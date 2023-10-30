import Link from "next/link";
import { useRouter } from "next/router";
import { Children, ReactElement, type FC, type ReactNode, cloneElement } from "react";

const things = { I: "issues", M: "milestones", P: "pull-requests" } as const;
const hashtagRegExp = /#([MIP])(\d+)/g;

type HashtagLinkProps = { children: ReactNode; href?: string };

export const HashtagLink: FC<HashtagLinkProps> = ({ children, href }) => {
  const router = useRouter();
  const { repository, username } = router.query;

  const wrap = (text: string) =>
    href ? (
      <Link href={href} className="hover:text-blue-400 hover:underline">
        {text}
      </Link>
    ) : (
      text
    );

  return (
    <>
      {Children.map(children, (child) => {
        if (typeof child !== "string") {
          if (typeof child === "object") {
            const elem = child as ReactElement;
            return elem.props.children
              ? cloneElement(elem, elem.props, <HashtagLink>{elem.props.children}</HashtagLink>)
              : elem;
          }
          return child;
        }
        const hashtags: RegExpExecArray[] = [];
        let result;
        while ((result = hashtagRegExp.exec(child)) !== null) hashtags.push(result);
        let index = 0;
        const newChildren = [];
        for (let hashtag of hashtags) {
          const [text, thing, id] = hashtag;
          newChildren.push(wrap(child.slice(index, hashtag.index)));
          newChildren.push(
            <Link
              href={`/r/${username}/${repository}/${things[thing as "I" | "M" | "P"]}/${id}`}
              key={hashtag.index}
              className="text-blue-400 hover:underline"
            >
              {text}
            </Link>
          );
          index = hashtag.index + text.length;
        }
        newChildren.push(wrap(child.slice(index)));
        return newChildren;
      })}
    </>
  );
};
