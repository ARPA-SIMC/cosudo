from django.test import TestCase
from django.conf import settings
from django.contrib.auth.models import User, Permission
from django.urls import reverse
from tempfile import TemporaryDirectory


# Create your tests here.
class MapTestCase(TestCase):

    def test_template(self):
        response = self.client.get(reverse('map'))
        self.assertTemplateUsed(response, 'map.html')

    def test_context(self):
        response = self.client.get(reverse('map'))
        url = settings.BORINUD_URL if hasattr(settings, 'BORINUD_URL') else "/borinud/api/v1"
        self.assertEqual(response.context['url_borinud'], url)


class ExtractPageTestCase(TestCase):
    def setUp(self):
        # Create a user
        test_user1 = User.objects.create_user(username='testuser1', password='1X<ISRUkw+tuK')
        test_user2 = User.objects.create_user(username='testuser2', password='2HJ1vRV0Z&3iD')
        test_user1.save()
        test_user2.save()
        permission = Permission.objects.get(codename='can_extract')
        test_user2.user_permissions.add(permission)
        test_user2.save()

    def test_redirect_if_not_logged_in(self):
        response = self.client.get(reverse('extract-page'))
        # Manually check redirect (Can't use assertRedirect, because the redirect URL is unpredictable)
        self.assertEqual(response.status_code, 302)
        #self.assertTrue(response.url.startswith('/registrazione/login'))

    def test_redirect_if_logged_in_but_not_correct_permission(self):
        login = self.client.login(username='testuser1', password='1X<ISRUkw+tuK')
        response = self.client.get(reverse('extract-page'))
        self.assertEqual(response.status_code, 302)

    def test_uses_correct_template(self):
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        response = self.client.get(reverse('extract-page'))
        self.assertEqual(response.status_code, 200)

        # Check we used correct template
        self.assertTemplateUsed(response, 'extract_page.html')

    def test_not_correct_parameters_or_settings(self):
        login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
        response = self.client.post(reverse('extract-page'))
        self.assertEqual(response.status_code, 500)
        # Check we used correct template

    def test_correct_parameters_and_settings(self):
        with TemporaryDirectory() as d:
            with self.settings(REPOSITORY_DIR=d, USERNAME_ARKIWEB="prova", PASSWORD_ARKIWEB="prova"):
                login = self.client.login(username='testuser2', password='2HJ1vRV0Z&3iD')
                response = self.client.post(reverse('extract-page'),
                                            {"startTime": "",
                                             "endTime": "",
                                             "product": ["s", "s"],
                                             "level": ["s", "s"],
                                             "dataset": ""})
                self.assertEqual(response.status_code, 500)
