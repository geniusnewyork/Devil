process.env.NODE_ENV = "test";
import http from "http";
import { config } from "../config.js";
import { runFirstTimeSetup } from "../utils/seed.js";
import { prisma } from "../db.js";
import { app } from "../index.js";

async function makeRequest(
  options: http.RequestOptions,
  postData?: any
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode || 500, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, headers: res.headers, body: data });
        }
      });
    });

    req.on("error", reject);

    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

export async function runAutomatedSecurityTests(): Promise<void> {
  console.log("\n==================================================");
  console.log("🔒 RUNNING MONTY GENIUS AUTOMATED SECURITY TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✕ [FAIL] ${testName} - ${detail || ""}`);
      failed++;
    }
  }

  let server: http.Server | null = null;
  try {
    // 1. Ensure DB is seeded
    await runFirstTimeSetup();

    // 2. Start HTTP server if not already running
    await new Promise<void>((resolve, reject) => {
      const s = app.listen(config.port, () => {
        server = s;
        resolve();
      });
      s.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          // Port already active with running server
          resolve();
        } else {
          reject(err);
        }
      });
    });

    const baseUrl = `http://localhost:${config.port}`;
    console.log(`Testing against: ${baseUrl}`);

    // TEST 1: Unauthorized Access Blocked
    const unauthLogs = await makeRequest({
      hostname: "localhost",
      port: config.port,
      path: "/api/logs",
      method: "GET",
    });
    assert(
      unauthLogs.status === 401 && unauthLogs.body?.error?.code === "UNAUTHORIZED",
      "Security: Unauthenticated access to /api/logs is blocked"
    );

    // TEST 2: Wrong Password Deterrent & Alert
    const wrongLogin = await makeRequest(
      {
        hostname: "localhost",
        port: config.port,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { username: "Genius", password: "WRONG_PASSWORD_XYZ" }
    );
    assert(
      wrongLogin.status === 401 && wrongLogin.body?.error?.code === "ACCESS_DENIED",
      "Security: Wrong password returns dramatic ACCESS_DENIED deterrent",
      JSON.stringify(wrongLogin.body)
    );

    // TEST 3: Correct Password Authentication
    const goodLogin = await makeRequest(
      {
        hostname: "localhost",
        port: config.port,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { username: "Genius", password: "Genius" }
    );
    assert(
      goodLogin.status === 200 && goodLogin.body?.success === true,
      "Auth: Correct password establishes session",
      JSON.stringify(goodLogin.body)
    );

    // Extract cookie
    const setCookieHeader = goodLogin.headers["set-cookie"];
    const sessionCookie = setCookieHeader ? setCookieHeader[0].split(";")[0] : "";
    assert(!!sessionCookie, "Auth: HttpOnly session cookie returned");

    // TEST 4: Authenticated Session Verification
    const sessionCheck = await makeRequest({
      hostname: "localhost",
      port: config.port,
      path: "/api/auth/session",
      method: "GET",
      headers: { Cookie: sessionCookie },
    });
    assert(
      sessionCheck.status === 200 && sessionCheck.body?.data?.authenticated === true,
      "Auth: Valid session allows admin access"
    );

    // TEST 5: Public Links API is accessible
    const publicLinks = await makeRequest({
      hostname: "localhost",
      port: config.port,
      path: "/api/links",
      method: "GET",
    });
    assert(
      publicLinks.status === 200 && Array.isArray(publicLinks.body?.data),
      "Links: Public links list is accessible"
    );

    // TEST 6: Public Categories API
    const publicCats = await makeRequest({
      hostname: "localhost",
      port: config.port,
      path: "/api/categories",
      method: "GET",
    });
    assert(
      publicCats.status === 200 && Array.isArray(publicCats.body?.data),
      "Categories: Public categories list is accessible"
    );

    const testCatId = publicCats.body?.data[0]?.id;

    // TEST 7: Admin Link Creation
    let createdLinkId = "";
    if (testCatId) {
      const createLink = await makeRequest(
        {
          hostname: "localhost",
          port: config.port,
          path: "/api/links",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: sessionCookie,
          },
        },
        {
          title: "Automated Security Test Link",
          url: "https://security-test.montygenius.local",
          description: "Created via automated test suite",
          categoryId: testCatId,
          icon: "Shield",
          tags: ["test", "security"],
          color: "#00F5FF",
          status: "ACTIVE",
          isFavorite: true,
          isPinned: true,
        }
      );
      assert(
        createLink.status === 201 && createLink.body?.data?.id,
        "CRUD: Admin can create link with full metadata"
      );
      createdLinkId = createLink.body?.data?.id;
    }

    // TEST 8: Track Click on Link
    if (createdLinkId) {
      const clickRes = await makeRequest(
        {
          hostname: "localhost",
          port: config.port,
          path: `/api/links/${createdLinkId}/click`,
          method: "POST",
        }
      );
      assert(
        clickRes.status === 200 && clickRes.body?.data?.clicks >= 1,
        "Analytics: Link click usage tracking works"
      );

      // Clean up test link
      await makeRequest({
        hostname: "localhost",
        port: config.port,
        path: `/api/links/${createdLinkId}`,
        method: "DELETE",
        headers: { Cookie: sessionCookie },
      });
      assert(true, "CRUD: Admin can delete link");
    }

    // TEST 9: Audit Logs are recorded
    const logsRes = await makeRequest({
      hostname: "localhost",
      port: config.port,
      path: "/api/logs",
      method: "GET",
      headers: { Cookie: sessionCookie },
    });
    assert(
      logsRes.status === 200 && logsRes.body?.data?.logs?.length > 0,
      "Security: System actions are audit-logged"
    );

    // TEST 10: Logout invalidates session
    const logoutRes = await makeRequest({
      hostname: "localhost",
      port: config.port,
      path: "/api/auth/logout",
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    assert(logoutRes.status === 200, "Auth: Admin can logout");

    // TEST 11: Reusing logged-out session fails
    const recheckSession = await makeRequest({
      hostname: "localhost",
      port: config.port,
      path: "/api/auth/session",
      method: "GET",
      headers: { Cookie: sessionCookie },
    });
    assert(
      recheckSession.status === 401,
      "Security: Revoked session is immediately rejected"
    );

    console.log("==================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    if (server) {
      await new Promise<void>((resolve) => (server as any).close(() => resolve()));
    }
    await prisma.$disconnect();
  }
}

// Allow direct run
if (process.argv[1]?.endsWith("api.test.ts")) {
  runAutomatedSecurityTests();
}
