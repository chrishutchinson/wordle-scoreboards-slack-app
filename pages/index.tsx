import { useSession, signOut } from "next-auth/client";
import Head from "next/head";
import Image from "next/image";
import { AddToSlackButton } from "../components/AddToSlackButton/AddToSlackButton";

const AuthContainer = () => {
  const [session] = useSession();

  if (session) {
    return (
      <div>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <AddToSlackButton />
    </div>
  );
};

const Home = () => {
  return (
    <>
      <Head>
        <title>Wordle Scoreboard for Slack</title>
        <meta
          name="description"
          content="Compete with your teammates at the most viral word game since the last viral word game!"
        />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          property="og:url"
          content="https://wordle-scoreboards.chrishutchinson.me/"
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Wordle Scoreboard for Slack" />
        <meta
          property="og:description"
          content="Compete with your teammates at the most viral word game since the last viral word game!"
        />
        <meta
          property="og:image"
          content="https://wordle-scoreboards.chrishutchinson.me/meta-image.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 1000,
          margin: "0 auto",
          padding: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              marginRight: "10px",
            }}
          >
            <Image
              src="/logo.png"
              width="100"
              height="100"
              alt="Wordle Scoreboards Logo"
            />
          </div>

          <div>
            <h1>
              Wordle Scoreboards <small>for Slack</small>
            </h1>
            <p>
              Compete with your teammates at the most viral word game since the
              last viral word game!
            </p>
          </div>
        </div>
        <hr />
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <AuthContainer />
        </div>
        <div>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/nqjn7EwD90U"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </>
  );
};

export default Home;
