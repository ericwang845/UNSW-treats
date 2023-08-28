Assumptions:

channelsListV1(authUserId):
- if authUserId is not valid, return {error: 'error'}
- if there is no user at all, return {error: 'error'}
- if a valid authUserId is not part of any channel, return []

channelsListallv1(authUserId):
- if authUserId is not valid, return {error: 'error'}
- if there is no user at all, return {error: 'error'}
- if there is user but no channel created at all, return []

channelJoinV1(authUserId, channelId):
- AuthUserUd may not always be valid —> if authUserId is not valid, return {error: 'error'}

authRegisterV1(email, password, nameFirst, nameLast):
- Assumption made that a handle cannot be an empty string ''
- In the case that a handle generated for a user is an empty string 
(first name and last name consist of only non-alphanumeric characters), the generated handle
will be '0' if not taken, and then '1' and so on... 
- Assumption made that a user cannot be unregistered, when generating ids for new users.

channelsCreateV1 (authUserId, name, isPublic)
- authuserId will not always match an id in dataStore -> if authUserId is not valid, return {error: 'error'}

channelDetaislV1 (authUserId, channelId)
- authuserId will not always match an id in dataStore -> if authUserId is not valid, return {error: 'error'}

channelMessagesV1 (authUserId, channelId, start)
- channels in dataStore contain a key to store message objects

clearV1():
- is assumed to successfully reset the stored data to an empty state without causing problems
