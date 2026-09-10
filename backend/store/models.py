from django.db import models
from django.contrib.auth.models import User

# ===== PERFIL DO USUÁRIO =====
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    telefone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefone")
    cep = models.CharField(max_length=10, blank=True, null=True, verbose_name="CEP")
    rua = models.CharField(max_length=255, blank=True, null=True, verbose_name="Rua")
    numero = models.CharField(max_length=20, blank=True, null=True, verbose_name="Número")
    bairro = models.CharField(max_length=100, blank=True, null=True, verbose_name="Bairro")
    cidade = models.CharField(max_length=100, blank=True, null=True, verbose_name="Cidade")
    estado = models.CharField(max_length=2, blank=True, null=True, verbose_name="Estado")

    def __str__(self):
        return f"Perfil de {self.user.email}"


# ===== CATEGORIAS DOS PRODUTOS =====
class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nome da Categoria")
    slug = models.SlugField(unique=True, verbose_name="Atalho / Slug")

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"

    def __str__(self):
        return self.name


# ===== PRODUTOS DA LOJA =====
class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', null=True, blank=True, verbose_name="Categoria")
    title = models.CharField(max_length=255, verbose_name="Título")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Preço")
    old_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name="Preço Antigo")
    discount = models.IntegerField(default=0, verbose_name="Desconto (%)")
    image_url = models.CharField(max_length=255, blank=True, null=True, verbose_name="Caminho da Imagem")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"

    def __str__(self):
        return f"{self.title} - R$ {self.price}"