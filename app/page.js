import EnvelopeIntro from "./components/EnvelopeIntro";
import Hero from "./components/Hero";
import ClipboardTransition from "./components/ClipboardTransition";
import Gallery from "./components/Gallery";
import GiftRegistry from "./components/GiftRegistry";
import Rsvp from "./components/Rsvp";
import Guestbook from "./components/Guestbook";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={`${styles.page} intro-boot-page`}>
      <EnvelopeIntro />
      <Hero showPrivateDetails={false} />
      <ClipboardTransition />
      <Gallery />
      <GiftRegistry />
      <Rsvp />
      <Guestbook />
    </main>
  );
}
