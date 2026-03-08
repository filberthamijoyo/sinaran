import { Header } from '../../components/Header';

export default function SpinningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="app-main">
        <div className="container">{children}</div>
      </main>
    </>
  );
}
