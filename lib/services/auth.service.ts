'use server'

export async function signup(formData: FormData) {}
export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
}
