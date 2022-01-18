import { useSession, signIn, signOut } from "next-auth/client";
import Image from "next/image";

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
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );
};

const Home = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 1000,
        margin: "0 auto",
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
            width="40"
            height="40"
            alt="Wordle Scoreboards Logo"
          />
        </div>

        <h1>
          Wordle Scoreboards <small>for Slack</small>
        </h1>
      </div>
      <hr />

      <AuthContainer />

      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/nqjn7EwD90U"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default Home;
