import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabase } from './supabase'

const KakaoProvider = {
  id: 'kakao',
  name: 'Kakao',
  type: 'oauth' as const,
  authorization: 'https://kauth.kakao.com/oauth/authorize?scope=account_email,profile_nickname,profile_image',
  token: 'https://kauth.kakao.com/oauth/token',
  userinfo: 'https://kapi.kakao.com/v2/user/me',
  clientId: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: String(profile.id),
      name: profile.kakao_account?.profile?.nickname,
      email: profile.kakao_account?.email,
      image: profile.kakao_account?.profile?.profile_image_url
    }
  }
}

const NaverProvider = {
  id: 'naver',
  name: 'Naver',
  type: 'oauth' as const,
  authorization: 'https://nid.naver.com/oauth2.0/authorize',
  token: 'https://nid.naver.com/oauth2.0/token',
  userinfo: 'https://openapi.naver.com/v1/nid/me',
  clientId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: profile.response.id,
      name: profile.response.name,
      email: profile.response.email,
      image: profile.response.profile_image
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    KakaoProvider as any,
    NaverProvider as any
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      // 유저 정보를 Supabase에 upsert
      const { error } = await supabase.from('users').upsert(
        {
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account?.provider
        },
        { onConflict: 'email' }
      )

      if (error) {
        console.error('supabase upsert error', error)
        return false
      }

      return true
    },
    async session({ session }) {
      if (!session.user?.email) return session

      // 유저 페이지 정보 조회
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single()

      if (userRow) {
        const { data: page } = await supabase
          .from('pages')
          .select('username')
          .eq('user_id', userRow.id)
          .single()

        ;(session as any).userId = userRow.id
        ;(session as any).username = page?.username ?? null
      }

      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET
}
