import Image from "next/image";


interface EmptyProps {
  label: string;
}

export const Empty = ({
  label
}: EmptyProps) => {
  return (
    <div className="h-full p-20 flex flex-col items-center justify-center">
      <div className="relative h-14 w-14 mb-10">
        <Image src="/cologo.png" fill alt="Empty" />
      </div>
      <p className="text-muted-foreground text-xl text-center">
        {label}
      </p>
    </div>
  );
};
