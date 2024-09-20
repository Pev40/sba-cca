import dynamic from 'next/dynamic';

const RegistroForm = dynamic(() => import('./RegisterForm'), {
  ssr: false  // Desactiva el Server-Side Rendering para este componente
});

export default function Home() {
  return (
    <div >
      <RegistroForm />
    </div>
  );
}
