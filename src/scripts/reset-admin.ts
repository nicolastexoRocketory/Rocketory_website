import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
	const payload = await getPayload({ config })
	const email = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@rocketory.de'
	const password = process.env.PAYLOAD_ADMIN_PASSWORD || 'Rocketory2026!'

	const found = await payload.find({
		collection: 'users',
		where: { email: { equals: email } },
		limit: 1,
	})

	if (found.docs.length === 0) {
		await payload.create({
			collection: 'users',
			data: { email, password, name: 'Rocketory Admin' },
		})
		console.log(`Admin erstellt: ${email}`)
	} else {
		await payload.update({
			collection: 'users',
			id: found.docs[0].id,
			data: { password },
		})
		console.log(`Passwort zurückgesetzt: ${email}`)
	}

	process.exit(0)
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
