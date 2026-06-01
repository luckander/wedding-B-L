import Hero from "../components/Hero";
import Gallery from "../components/Gallery";
import Rsvp from "../components/Rsvp";
import GiftRegistry from "../components/GiftRegistry";
import Guestbook from "../components/Guestbook";
import { FlowerDivider } from "../components/Decorations";
import styles from "../page.module.css";

export default async function InvitePage({ params }) {
  const { slug } = await params;

  return (
    <main className={styles.page}>
      <Hero />
      <Gallery />
      <FlowerDivider className={styles.sectionDivider} />
      <Rsvp inviteSlug={slug} />
      <FlowerDivider className={styles.sectionDivider} />
      <GiftRegistry />
      <Guestbook />
    </main>
  );
}
