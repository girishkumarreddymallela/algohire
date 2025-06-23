import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import * as admin from 'firebase-admin'
import * as logger from 'firebase-functions/logger'

admin.initializeApp()
const db = admin.firestore()

export const createNoteNotification = onDocumentCreated(
  'candidates/{candidateId}/notes/{noteId}',
  async (event) => {
    const snap = event.data
    if (!snap) {
      logger.log('No data associated with the event, skipping.')
      return
    }
    const noteData = snap.data()
    const { candidateId } = event.params

    const { text, authorName, authorId } = noteData
    logger.log(`New note created in candidate ${candidateId} by ${authorName}`)

    const mentionsRegex = /@(\w+)/g
    const mentions = typeof text === 'string' ? text.match(mentionsRegex) : null

    if (!mentions || mentions.length === 0) {
      logger.log('No mentions found in the note.')
      return
    }

    const candidateDoc = await db
      .collection('candidates')
      .doc(candidateId)
      .get()
    const candidateName = candidateDoc.data()?.name || 'A candidate'

    const mentionedUsernames = mentions.map((m: string) => m.substring(1))
    const uniqueUsernames = [...new Set(mentionedUsernames)]
    logger.log('Found mentions for:', uniqueUsernames.join(', '))

    for (const username of uniqueUsernames) {
      const usersRef = db.collection('users')
      const userQuery = await usersRef
        .where('username', '==', username)
        .limit(1)
        .get()

      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0]
        const recipientId = userDoc.id

        if (recipientId === authorId) {
          logger.log(`Skipping self-notification for ${username}`)
          continue
        }

        logger.log(
          `Found user ${username} with ID ${recipientId}. Creating notification.`,
        )

        const notificationPayload = {
          recipientId,
          senderName: authorName,
          candidateId,
          candidateName,
          noteId: snap.id,
          messagePreview: text.substring(0, 100),
          isRead: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        await db.collection('notifications').add(notificationPayload)
        logger.log(`Notification created for ${username}`)
      } else {
        logger.log(`User with username ${username} not found.`)
      }
    }
    logger.log('Finished processing all mentions.')
  },
)
