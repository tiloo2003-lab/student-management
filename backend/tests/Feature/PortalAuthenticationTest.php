<?php

namespace Tests\Feature;

use Tests\TestCase;

class PortalAuthenticationTest extends TestCase
{
    public function test_guests_cannot_read_or_modify_portal_content(): void
    {
        foreach (['/home', '/categories', '/posts', '/posts/1', '/posts/1/comments'] as $path) {
            $this->getJson('/api'.$path)->assertUnauthorized();
        }

        $this->postJson('/api/posts/1/like')->assertUnauthorized();
        $this->deleteJson('/api/posts/1/like')->assertUnauthorized();
        $this->postJson('/api/contact', [])->assertUnauthorized();
    }

    public function test_login_remains_accessible_to_guests(): void
    {
        $this->postJson('/api/login', [])->assertUnprocessable();
    }
}
