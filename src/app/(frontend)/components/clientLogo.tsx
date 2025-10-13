import Image from "next/image";

export const ClientLogo = ({ src }: { src: string }) => {
  return (
    <div className="flex items-center justify-center">
      <Image
        src={src}
        alt="client logo"
        width={140}
        height={120}
        className="w-auto object-contain"
      />
    </div>
  );
};
