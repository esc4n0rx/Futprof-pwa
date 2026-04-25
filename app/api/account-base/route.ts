import { promises as fs } from "fs"
import path from "path"
import { NextResponse } from "next/server"
import type { BaseAccountRecord, ConsumeAccountBasePayload } from "@/lib/types/accounts"

export const runtime = "nodejs"

const basePath = path.join(process.cwd(), "data", "base.json")

async function readBaseAccounts(): Promise<BaseAccountRecord[]> {
  const raw = await fs.readFile(basePath, "utf8")
  const parsed = JSON.parse(raw) as unknown

  if (!Array.isArray(parsed)) {
    throw new Error("data/base.json precisa conter uma lista de contas.")
  }

  return parsed as BaseAccountRecord[]
}

async function writeBaseAccounts(accounts: BaseAccountRecord[]): Promise<void> {
  await fs.writeFile(basePath, `${JSON.stringify(accounts, null, 2)}\n`, "utf8")
}

export async function GET() {
  try {
    const accounts = await readBaseAccounts()
    return NextResponse.json({ accounts })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao ler data/base.json." },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as ConsumeAccountBasePayload
    const usedKeys = new Set(payload.used.map((item) => `${item.email}|${item.cpf}`))
    const accounts = await readBaseAccounts()
    const nextAccounts = accounts.filter((account) => !usedKeys.has(`${account.email}|${account.cpf}`))

    await writeBaseAccounts(nextAccounts)

    return NextResponse.json({
      removed: accounts.length - nextAccounts.length,
      remaining: nextAccounts.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao atualizar data/base.json." },
      { status: 500 },
    )
  }
}
