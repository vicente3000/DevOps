-- CreateTable
CREATE TABLE "Persona" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "ciudad" TEXT NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gusto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "personaId" INTEGER NOT NULL,

    CONSTRAINT "Gusto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Persona_rut_key" ON "Persona"("rut");

-- AddForeignKey
ALTER TABLE "Gusto" ADD CONSTRAINT "Gusto_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
